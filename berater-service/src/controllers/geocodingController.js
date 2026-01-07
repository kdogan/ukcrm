const https = require('https');

const NOMINATIM_HOST = 'nominatim.openstreetmap.org';

/**
 * @desc    Suche nach Adressen via Nominatim (Proxy)
 * @route   GET /api/geocoding/search
 * @access  Private
 */
const searchAddress = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 3) {
      return res.json({
        success: true,
        data: []
      });
    }

    const params = new URLSearchParams({
      q,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      countrycodes: 'de,at,ch'
    });

    const options = {
      hostname: NOMINATIM_HOST,
      path: `/search?${params.toString()}`,
      method: 'GET',
      headers: {
        'User-Agent': 'BeraterApp/1.0 (contact@eskapp.com)'
      }
    };

    const nominatimRequest = https.request(options, (nominatimRes) => {
      let data = '';

      nominatimRes.on('data', (chunk) => {
        data += chunk;
      });

      nominatimRes.on('end', () => {
        try {
          const results = JSON.parse(data);
          const suggestions = results.map(result => {
            const address = result.address || {};
            const street = address.road || '';
            const houseNumber = address.house_number || '';
            const city = address.city || address.town || address.village || address.municipality || '';
            const zipCode = address.postcode || '';

            return {
              displayName: result.display_name,
              street: houseNumber ? `${street} ${houseNumber}` : street,
              houseNumber,
              zipCode,
              city,
              country: address.country || ''
            };
          });

          res.json({
            success: true,
            data: suggestions
          });
        } catch (parseError) {
          console.error('Geocoding parse error:', parseError.message);
          res.status(500).json({
            success: false,
            message: 'Fehler bei der Adresssuche'
          });
        }
      });
    });

    nominatimRequest.on('error', (error) => {
      console.error('Geocoding error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Fehler bei der Adresssuche'
      });
    });

    nominatimRequest.end();
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Fehler bei der Adresssuche'
    });
  }
};

module.exports = {
  searchAddress
};
