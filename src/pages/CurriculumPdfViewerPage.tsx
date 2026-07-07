import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PDFViewerModal from '../components/PDFViewerModal';
import { resolvePdfResource, resolveTopicKeyFromParams } from '../utils/curriculumTopicResolver';
import { buildTopicPath } from '../utils/pdfViewerPaths';
import { topicData } from './TopicPage';

const CurriculumPdfViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const { type, board, subject, title, pdfFile } = useParams<{
    type: string;
    board: string;
    subject: string;
    title: string;
    pdfFile: string;
  }>();

  const topicKey = resolveTopicKeyFromParams(topicData, title, subject);
  const topic = topicKey ? topicData[topicKey] : null;
  const resource = topic && pdfFile ? resolvePdfResource(topic, pdfFile) : null;

  const topicSlug = title ? decodeURIComponent(title) : '';
  const topicPath = type && board && subject && topicSlug
    ? buildTopicPath({
        type,
        board,
        subject: decodeURIComponent(subject),
        topicSlug,
      })
    : '/curriculum';

  if (!topic || !resource || !pdfFile?.toLowerCase().endsWith('.pdf')) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">PDF Not Found</h1>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
          We couldn&apos;t find that document. It may have moved or the link is incorrect.
        </p>
        <Link
          to={topicPath}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to topic
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <PDFViewerModal
        pdfUrl={resource.url}
        fileName={resource.title}
        onClose={() => navigate(topicPath)}
        engagementContext={
          topicKey
            ? { topicId: topicKey, resourceId: resource.id }
            : undefined
        }
      />
    </div>
  );
};

export default CurriculumPdfViewerPage;
