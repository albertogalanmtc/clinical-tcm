// Utility to reset community data (for testing/debugging)

export function resetCommunityData() {
  if (confirm('¿Estás seguro de que quieres borrar todos los datos de la comunidad?')) {
    localStorage.removeItem('community_posts');
    localStorage.removeItem('community_comments');
    localStorage.removeItem('community_user_interactions');
    localStorage.removeItem('community_post_counter');
    localStorage.removeItem('community_comment_counter');
    localStorage.removeItem('community_sample_data_initialized');

    window.dispatchEvent(new CustomEvent('community-posts-updated'));

    console.log('✅ Community data reset. Refresh to load sample data again.');
    alert('Datos borrados. Recarga la página para volver a cargar los datos de muestra.');
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).resetCommunityData = resetCommunityData;
}
