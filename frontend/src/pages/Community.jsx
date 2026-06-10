import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Send, Image, X, Plus, AlertCircle, User } from 'lucide-react';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentTexts, setCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentingPostId, setCommentingPostId] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('content', content);
    if (mediaFile) formData.append('media', mediaFile);
    try {
      await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      fetchPosts();
    } catch (err) {}
    finally { setSubmitting(false); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: res.data.likes_count, likes: res.data.likes } : p));
    } catch (err) {}
  };

  const handleAddComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: text });
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        comments_count: p.comments_count + 1,
        comments: [...(p.comments || []), res.data]
      } : p));
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {}
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {}
  };

  return (
    <DashboardLayout title="Communauté">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Create Post Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
          <div className="flex gap-3 mb-4">
            <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0" />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Partagez une aventure de votre compagnon... 🐾"
              className="flex-1 resize-none rounded-2xl border border-slate-200 p-3.5 text-sm placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-slate-50/40 h-20"
            />
          </div>

          {/* Media preview */}
          {mediaPreview && (
            <div className="relative mb-4 rounded-2xl overflow-hidden border border-slate-100">
              <img src={mediaPreview} alt="Preview" className="w-full max-h-52 object-cover" />
              <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-2 right-2 h-7 w-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold">
              <Image size={16} />
              Ajouter une photo
              <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
            </label>
            <button
              onClick={handleCreatePost}
              disabled={!content.trim() || submitting}
              className="px-5 py-2.5 bg-secondary hover:bg-secondary-hover disabled:bg-slate-200 text-white text-xs font-bold rounded-xl shadow-sm shadow-secondary/15 transition-all flex items-center justify-center gap-1.5 min-w-[100px]"
            >
              <span className="flex items-center justify-center gap-1.5">
                {submitting ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send size={13} />
                )}
                <span>{submitting ? "Envoi..." : "Publier"}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 animate-pulse rounded-3xl bg-slate-100"></div>)}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
            <p className="text-slate-400 text-sm font-medium">Aucune publication pour l'instant. Soyez le premier à partager !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => {
              const isLiked = post.likes?.includes(user?.id);
              const showComments = expandedComments[post.id];
              return (
                <div key={post.id} className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
                  {/* Post Header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-3">
                      <img src={post.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.name}`} alt={post.user?.name} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{post.user?.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    {(user?.id === post.user_id || user?.role === 'admin') && (
                      <button onClick={() => handleDeletePost(post.id)} className="text-slate-300 hover:text-red-400 transition-colors"><X size={16} /></button>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="px-5 pb-3 text-sm text-slate-700 leading-relaxed">{post.content}</p>

                  {/* Post Media */}
                  {post.media && <img src={post.media} alt="Post media" className="w-full max-h-80 object-cover" />}

                  {/* Post Actions */}
                  <div className="flex items-center gap-5 px-5 py-3.5 border-t border-slate-100">
                    <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 text-xs font-bold transition-all ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                      <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                      {post.likes_count} J'aime
                    </button>
                    <button onClick={() => { setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] })); setCommentingPostId(post.id); }} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-secondary transition-colors">
                      <MessageCircle size={16} />
                      {post.comments_count} Commentaires
                    </button>
                  </div>

                  {/* Comments Area */}
                  {showComments && (
                    <div className="border-t border-slate-100 px-5 py-4 space-y-3 bg-slate-50/30">
                      {(post.comments || []).map((c, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start">
                          <img src={c.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user?.name}`} alt={c.user?.name} className="h-7 w-7 rounded-full border border-slate-200 object-cover shrink-0 mt-0.5" />
                          <div className="bg-white border border-slate-100 rounded-2xl px-3 py-2 flex-1">
                            <span className="text-[10px] font-bold text-slate-700">{c.user?.name}</span>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      {/* Add comment input */}
                      <div className="flex gap-2 mt-2">
                        <img src={user?.avatar} alt={user?.name} className="h-7 w-7 rounded-full border border-slate-200 object-cover shrink-0" />
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Ajouter un commentaire..."
                            value={commentTexts[post.id] || ''}
                            onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white placeholder-slate-400 transition-all"
                          />
                          <button onClick={() => handleAddComment(post.id)} className="h-8 w-8 rounded-xl bg-secondary text-white flex items-center justify-center hover:bg-secondary-hover transition-colors shrink-0">
                            <Send size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Community;
