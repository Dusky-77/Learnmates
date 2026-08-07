import { createServerClient } from '../lib/supabase-server.js';

// Constants for XP rules
const XP_RULES = {
  download: {
    amount: 25,
    dailyCap: 75
  },
  paper_download: {
    amount: 30,
    dailyCap: 60
  }
};

function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

export default async function handler(req, res) {
  applyCors(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const supabase = createServerClient();
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { resourceId, resourceName, resourceType = 'file' } = req.body;
    if (!resourceId) {
      return res.status(400).json({ error: 'Missing resourceId' });
    }

    const action = resourceType === 'paper' ? 'paper_download' : 'download';
    const amount = XP_RULES[action].amount;
    const dailyCap = XP_RULES[action].dailyCap;

    // Call RPC to award XP
    const { data: awarded, error: rpcError } = await supabase.rpc('fn_award_capped_xp', {
      p_user_id: user.id,
      p_action: action,
      p_ref_id: resourceId,
      p_amount: amount,
      p_daily_cap: dailyCap,
      p_metadata: {
        file_name: resourceName || resourceId,
      }
    });

    if (rpcError) {
      console.error('Failed to award XP:', rpcError);
      return res.status(500).json({ error: 'Failed to award XP' });
    }

    return res.status(200).json({
      success: true,
      xpAwarded: awarded || 0
    });

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
