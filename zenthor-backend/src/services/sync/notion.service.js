// sync/notion.service.js
async function syncNotion(userId, token) {
  // Obtener todas las páginas que el usuario ha compartido con la integración
  const response = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({ filter: { property: 'object', value: 'page' } })
  });
  const { results } = await response.json();

  for (const page of results) {
    // Extraer contenido de la página (bloques)
    const blocks = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Notion-Version': '2022-06-28' }
    }).then(r => r.json());
    const textContent = extractTextFromBlocks(blocks.results);

    // Guardar como documento en documentos_vector
    await supabase.from('documentos_vector').insert({
      usuario_id: userId,
      titulo: page.properties?.title?.title[0]?.plain_text || 'Sin título',
      fuente: 'notion',
      contenido: textContent,
      metadata: { notion_id: page.id, url: page.url }
    });
    // Llamar a n8n para vectorizar (o hacerlo inline)
  }
}