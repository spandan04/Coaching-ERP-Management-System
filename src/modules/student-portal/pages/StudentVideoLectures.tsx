import { useState, useEffect } from 'react';
import { Video, Play, Calendar, BookOpen, Clock, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../services/authentication/AuthContext';
import { VideoLecture } from '../../../types/index';
import { getPublishedVideoLectures } from '../../video-lesson-administration/services/videoLectureService';

const getEmbedUrl = (url: string) => {
  if (!url) return null;
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (url.includes('vimeo.com/')) {
    const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
  }
  return null;
};

export const StudentVideoLectures = () => {
  const { studentData } = useAuth();
  const [lectures, setLectures] = useState<VideoLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<VideoLecture | null>(null);

  useEffect(() => {
    const fetchLectures = async () => {
      if (studentData?.courseEnrolled && studentData?.batch) {
        setLoading(true);
        try {
          const fetched = await getPublishedVideoLectures(studentData.courseEnrolled, studentData.batch);
          setLectures(fetched);
        } catch (error) {
          console.error("Error fetching video lectures:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLectures();
  }, [studentData]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  if (selectedLecture) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <button 
          onClick={() => setSelectedLecture(null)}
          className="flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Lectures
        </button>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="aspect-video w-full bg-black relative">
            {getEmbedUrl(selectedLecture.videoUrl) ? (
              <iframe
                src={getEmbedUrl(selectedLecture.videoUrl)!}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                src={selectedLecture.videoUrl} 
                controls 
                className="w-full h-full object-contain"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{selectedLecture.title}</h1>
                <div className="flex items-center gap-2 text-indigo-400 font-medium">
                  <BookOpen className="w-4 h-4" />
                  {selectedLecture.subject}
                </div>
              </div>
              
              {selectedLecture.lectureDate && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-slate-300 text-sm font-medium self-start md:self-auto">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {selectedLecture.lectureDate}
                </div>
              )}
            </div>

            {selectedLecture.description && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-slate-400 leading-relaxed">
                  {selectedLecture.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight font-heading">Video Lectures</h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">Watch recorded lectures assigned to your batch.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lectures.map(lecture => (
          <div key={lecture.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col hover:border-indigo-500/50 transition-colors group">
            <div className="flex-1">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{lecture.title}</h3>
              <p className="text-sm font-medium text-indigo-400 mb-4">{lecture.subject}</p>
              
              <div className="space-y-2 text-sm text-slate-400 mb-6">
                {lecture.lectureDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>{lecture.lectureDate}</span>
                  </div>
                )}
                {lecture.description && (
                  <div className="text-xs text-slate-500 line-clamp-2 mt-2">
                    {lecture.description}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setSelectedLecture(lecture)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Watch Lecture
            </button>
          </div>
        ))}
        {lectures.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Video Lectures</h3>
            <p className="text-slate-400">There are no video lectures assigned to your batch at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
