import { MOCK_RESOURCES } from "@/features/student/mock/data";
import { FileText, Download, Link as LinkIcon, Image as ImageIcon, Search } from "lucide-react";

export default function ResourcesPage() {
  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText className="w-5 h-5" />;
      case 'Image': return <ImageIcon className="w-5 h-5" />;
      case 'Link': return <LinkIcon className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">Access study materials, brochures, and notes.</p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
            placeholder="Search resources..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_RESOURCES.map(resource => (
          <div key={resource.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-5 hover:border-brand-primary/30 transition-all group flex flex-col h-full">
            <div className="w-12 h-12 rounded-xl bg-brand-surface text-brand-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              {getResourceIcon(resource.type)}
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{resource.title}</h3>
              <p className="text-xs text-gray-500">{resource.type} {resource.size !== "-" && `• ${resource.size}`}</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
              <button className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover">
                Preview
              </button>
              <button className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
