import { LayoutDashboard, Newspaper, MessageSquare, ClipboardList, ChevronRight, FileText, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminDashboardContentHub() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const contentCards = [
    {
      id: 'dashboard',
      title: isSpanish ? 'Organización del dashboard' : 'Dashboard Organization',
      description: isSpanish
        ? 'Organiza el diseño y la posición del contenido en el dashboard'
        : 'Organize content layout and positioning on the dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard-organization',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'messages',
      title: isSpanish ? 'Mensajes' : 'Messages',
      description: isSpanish
        ? 'Crea y gestiona mensajes de bienvenida del dashboard'
        : 'Create and manage dashboard welcome messages',
      icon: FileText,
      href: '/admin/dashboard-content/messages',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'images',
      title: isSpanish ? 'Imágenes del carrusel' : 'Carousel Images',
      description: isSpanish
        ? 'Gestiona las diapositivas y ajustes del carrusel'
        : 'Manage carousel slides and settings',
      icon: ImageIcon,
      href: '/admin/dashboard-content/images',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 'banners',
      title: isSpanish ? 'Banners' : 'Banners',
      description: isSpanish
        ? 'Crea banners y anuncios para el dashboard'
        : 'Create dashboard banners and announcements',
      icon: MessageSquare,
      href: '/admin/dashboard-content/banners',
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 'surveys',
      title: isSpanish ? 'Cuestionarios' : 'Surveys',
      description: isSpanish
        ? 'Crea cuestionarios con preguntas para recopilar opinión de los usuarios'
        : 'Create surveys with questions to gather user feedback',
      icon: ClipboardList,
      href: '/admin/dashboard-content/surveys',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      id: 'news',
      title: isSpanish ? 'Noticias' : 'News',
      description: isSpanish
        ? 'Publica noticias y actualizaciones para los usuarios'
        : 'Publish news articles and updates for users',
      icon: Newspaper,
      href: '/admin/dashboard-content/news',
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isSpanish ? 'Contenido del dashboard' : 'Dashboard Content'}
        </h1>
        <p className="text-gray-600">
          {isSpanish
            ? 'Gestiona todo el contenido del dashboard y las funciones visibles para el usuario'
            : 'Manage all dashboard content and user-facing features'}
        </p>
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentCards.map((card) => (
          <Link
            key={card.id}
            to={card.href}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
