import { useState, useEffect } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

// ISO-2 Country codes with full names
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'GR', name: 'Greece' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IL', name: 'Israel' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
].sort((a, b) => a.name.localeCompare(b.name));

// Predefined color palette (professional, soft, clinical colors)
const AVATAR_COLORS = [
  { name: 'Teal', class: 'bg-[#0F8F83]' },
  { name: 'Blue', class: 'bg-[#2563EB]' },
  { name: 'Violet', class: 'bg-[#6D28D9]' },
  { name: 'Orange', class: 'bg-[#F97316]' },
  { name: 'Yellow', class: 'bg-[#EAB308]' },
  { name: 'Pink', class: 'bg-[#DB2777]' },
];

export default function ProfilePage() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const { 
    firstName,
    lastName,
    title,
    email, 
    country, 
    avatarColor, 
    avatarImage, 
    setName: setUserName,
    setFirstName: setUserFirstName,
    setLastName: setUserLastName,
    setTitle: setUserTitle,
    setCountry: setUserCountry, 
    setAvatarColor, 
    setAvatarImage 
  } = useUser();
  
  const [localFirstName, setLocalFirstName] = useState(firstName || '');
  const [localLastName, setLocalLastName] = useState(lastName || '');
  const [localTitle, setLocalTitle] = useState(title || '');
  const [localCountry, setLocalCountry] = useState(country || '');
  const [hasChanges, setHasChanges] = useState(false);


  useEffect(() => {
    setLocalFirstName(firstName || '');
    setLocalLastName(lastName || '');
    setLocalTitle(title || '');
    setLocalCountry(country || '');
  }, [firstName, lastName, title, country]);

  useEffect(() => {
    const isDirty = localFirstName !== firstName || localLastName !== lastName || localTitle !== title || localCountry !== country;
    setHasChanges(isDirty);
  }, [localFirstName, localLastName, localTitle, localCountry, firstName, lastName, title, country]);


  const handleSave = async () => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Update in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            first_name: localFirstName || '',
            last_name: localLastName || '',
            title: localTitle || '',
            country: localCountry || '',
          })
          .eq('id', session.user.id);

        if (updateError) {
          console.error('Error updating profile in Supabase:', updateError);
          // Continue to update local state even if Supabase fails
        }

        // Save to localStorage with email from auth session (not from context)
        const updatedProfile = {
          firstName: localFirstName || '',
          lastName: localLastName || '',
          title: localTitle || '',
          email: session.user.email || '', // Always use email from auth session
          country: localCountry || ''
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }

      // Update local state
      setUserFirstName(localFirstName || '');
      setUserLastName(localLastName || '');
      setUserTitle(localTitle || '');
      setUserCountry(localCountry || '');

      // Update the full name for avatar display
      setUserName(`${localFirstName || ''} ${localLastName || ''}`.trim());

      setHasChanges(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleAvatarColorChange = (color: string) => {
    setAvatarColor(color);
  };

  const handleAvatarImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSpanish ? 'Perfil' : 'Profile'}</h1>
        <p className="text-gray-600">
          {isSpanish ? 'Gestiona tu información personal y preferencias' : 'Manage your personal information and preferences'}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Combined Avatar & Personal Information Section */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
              {/* Left Column - Avatar */}
              <div className="lg:border-r lg:border-gray-200 lg:pr-8">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  {isSpanish ? 'Avatar' : 'Avatar'}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar name={(firstName || '') + ' ' + (lastName || '')} color={avatarColor} image={avatarImage} size="lg" />
                  </div>
                  
                  {/* Color Selection */}
                  {!avatarImage && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{isSpanish ? 'Color' : 'Color'}</p>
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_COLORS.map((color) => (
                          <button
                            key={color.class}
                            onClick={() => handleAvatarColorChange(color.class)}
                            className={`w-10 h-10 rounded-full ${color.class} flex items-center justify-center transition-all hover:scale-105 ${
                              avatarColor === color.class ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                            }`}
                            title={color.name}
                          >
                            {avatarColor === color.class && (
                              <Check className="w-5 h-5 text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Image */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{isSpanish ? 'Imagen personalizada' : 'Custom image'}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {isSpanish
                        ? 'Sube una imagen personalizada para tu avatar (logo, símbolo, foto)'
                        : 'Upload a custom image for your avatar (logo, symbol, photo)'}
                    </p>
                    
                    {avatarImage ? (
                      <button
                        onClick={() => setAvatarImage(null)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        {isSpanish ? 'Eliminar imagen' : 'Remove image'}
                      </button>
                    ) : (
                      <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {isSpanish ? 'Subir imagen' : 'Upload image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Personal Information */}
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  {isSpanish ? 'Información personal' : 'Personal Information'}
                </h2>
                
                <div className="space-y-5">
                  {/* Row 1: Title + First Name + Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr] gap-4">
                    {/* Title Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isSpanish ? 'Título' : 'Title'}
                      </label>
                      <select
                        value={localTitle || ''}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">{isSpanish ? 'Título' : 'Title'}</option>
                        <option value="Mr.">{isSpanish ? 'Sr.' : 'Mr.'}</option>
                        <option value="Mrs.">{isSpanish ? 'Sra.' : 'Mrs.'}</option>
                        <option value="Ms.">{isSpanish ? 'Sra.' : 'Ms.'}</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">{isSpanish ? 'Prof.' : 'Prof.'}</option>
                      </select>
                    </div>

                    {/* First Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isSpanish ? 'Nombre' : 'First name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={localFirstName || ''}
                        onChange={(e) => setLocalFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder={isSpanish ? 'Introduce tu nombre' : 'Enter your first name'}
                      />
                    </div>

                    {/* Last Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isSpanish ? 'Apellidos' : 'Last name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={localLastName || ''}
                        onChange={(e) => setLocalLastName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder={isSpanish ? 'Introduce tus apellidos' : 'Enter your last name'}
                      />
                    </div>
                  </div>

                  {/* Row 2: Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Country Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isSpanish ? 'País' : 'Country'} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={localCountry || ''}
                        onChange={(e) => setLocalCountry(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">{isSpanish ? 'Selecciona tu país' : 'Select your country'}</option>
                        {COUNTRIES.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {!localCountry && (
                        <div className="flex items-center gap-1.5 mt-2 text-amber-600 text-xs">
                          <AlertCircle className="w-4 h-4" />
                          <span>{isSpanish ? 'El país es obligatorio' : 'Country is required'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Country Note */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>{isSpanish ? 'Nota:' : 'Note:'}</strong>{' '}
                      {isSpanish
                        ? 'Tu país determina qué hierbas pueden estar restringidas en tu región debido a la normativa local.'
                        : 'Your country determines which herbs may be restricted in your region due to local regulations.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="px-6 py-4 bg-gray-50">
              <button
                onClick={handleSave}
                disabled={!localFirstName?.trim() || !localLastName?.trim() || !localCountry}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {isSpanish ? 'Guardar cambios' : 'Save changes'}
              </button>
            </div>
          )}
        </div>

      </div>

    </>
  );
}
