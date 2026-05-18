const axios = require('axios');

async function test() {
  const url = 'https://m.facebook.com/permalink.php?story_fbid=pfbid0Dz7ktwniBSHWSAQvPcGPHrjWnyjABUTKqcA8iTKEMhxcjiPjDncWHPDAc3DgyAXJl&id=61570730374806';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    });
    const html = res.data;
    console.log('HTML Length:', html.length);
    console.log('Title in HTML:', html.match(/<title>([^<]+)<\/title>/i)?.[1]);
    
    // Check if the actual text is in the HTML
    const keyword = 'paciencia';
    const index = html.toLowerCase().indexOf(keyword);
    if (index !== -1) {
      console.log('Keyword found! Context:', html.substring(index - 100, index + 300));
    } else {
      console.log('Keyword NOT found in HTML.');
    }
  } catch (err) {
    console.error('Error fetching mobile:', err.message);
  }
}

test();
