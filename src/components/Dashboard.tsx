import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ResourceCard } from './ResourceCard';
import type { Resource } from '../types/database';
import { LogOut, Upload as UploadIcon, Filter } from 'lucide-react';

interface DashboardProps {
  onNavigateToUpload: () => void;
}

export function Dashboard({ onNavigateToUpload }: DashboardProps) {
  const { signOut, user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResources(data as Resource[]);
      setFilteredResources(data as Resource[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    let filtered = resources;

    if (filterSubject) {
      filtered = filtered.filter(r =>
        r.subject.toLowerCase().includes(filterSubject.toLowerCase())
      );
    }

    if (filterSemester) {
      filtered = filtered.filter(r => r.semester === parseInt(filterSemester));
    }

    if (filterType) {
      filtered = filtered.filter(r =>
        r.type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  }, [filterSubject, filterSemester, filterType, resources]);

  const subjects = [...new Set(resources.map(r => r.subject))];
  const types = [...new Set(resources.map(r => r.type))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resource Hub</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateToUpload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <UploadIcon className="w-4 h-4" />
                Upload
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-600 text-lg">No resources found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or upload a new resource</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onUpdate={fetchResources}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
