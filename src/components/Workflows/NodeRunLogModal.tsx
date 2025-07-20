import React from 'react';
import { ComponentNode } from '../../types';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface NodeRunLogModalProps {
  node: ComponentNode;
  onClose: () => void;
}

export const NodeRunLogModal: React.FC<NodeRunLogModalProps> = ({ node, onClose }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  // Fixed timestamp - generate once and reuse to prevent updates during renders
  const logTimestamp = React.useMemo(() => new Date().toISOString().substring(11, 23), []);

  const runStatus = node.runStatus || 'skipped';
  const runLogs = node.runLogs || [];

  const getStatusColor = () => {
    switch (runStatus) {
      case 'success':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'running':
        return 'text-blue-400';
      case 'queued':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (runStatus) {
      case 'success':
        return '✓';
      case 'failed':
        return '✗';
      case 'running':
        return '●';
      case 'queued':
        return '○';
      default:
        return '—';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center z-50">
      <div
        className={`${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {node.name || `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node`}
            </h2>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
              {getStatusIcon()} {runStatus.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors`}>
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Terminal-like Log Display */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-black text-green-400 font-mono text-sm">
            {/* Terminal Header */}
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 text-gray-400 text-xs">Node Execution Log - {node.id}</div>
            </div>

            {/* Log Content */}
            <div className="h-full overflow-y-auto p-4 pb-20">
              {runLogs.length > 0 ? (
                runLogs.map((log, index) => (
                  <div key={index} className="mb-1 flex">
                    <span className="text-gray-500 mr-2 select-none">[{logTimestamp}]</span>
                    <span className="text-green-400">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">{t('nodeRunLog.noLogs', 'No logs available for this node execution.')}</div>
              )}

              {/* Cursor Blink */}
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 mr-2">[{logTimestamp}]</span>
                <span className="text-green-400">$</span>
                <span className="ml-1 bg-green-400 w-2 h-4 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} ${
              isDark ? 'text-white' : 'text-gray-900'
            } rounded transition-colors`}
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
