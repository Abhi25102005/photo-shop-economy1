import { ThumbsUp, Download, FileText, Calendar } from 'lucide-react';
import type { Resource } from '../types/database';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

interface ResourceCardProps {
  resource: Resource;
  onUpdate: () => void;
}

export function ResourceCard({ resource, onUpdate }: ResourceCardProps) {
  const [voting, setVoting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleVote = async () => {
    if (voting) return;
    setVoting(true);

    try {
      const { error } = await supabase
        .from('resources')
        .update({ votes: resource.votes + 1 })
        .eq('id', resource.id);

      if (!error) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setVoting(false);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const { error } = await supabase
        .from('resources')
        .update({ downloads: resource.downloads + 1 })
        .eq('id', resource.id);

      if (!error) {
        window.open(resource.file_url, '_blank');
        onUpdate();
      }
    } catch (err) {
      console.error('Error downloading:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {resource.subject}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Sem {resource.semester}
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {resource.type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{resource.branch}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{resource.year}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={handleVote}
            disabled={voting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="font-medium">{resource.votes}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-500">
            <Download className="w-4 h-4" />
            <span className="text-sm">{resource.downloads}</span>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
        >
          Download
        </button>
      </div>
    </div>
  );
}
