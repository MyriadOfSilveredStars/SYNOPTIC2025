const express = require('express');
const app = express();
const PORT = 3000

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.listen(PORT, () =>
{
	console.log('Server running on http://localhost:' + PORT);
});

app.get('/', (req, res) =>
{
	res.render('layout.ejs', { title: "Map", mainContent: "pages/map", includeParams: { API_URL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDx1nDqigjyOixfMY4kj485EaIkEi1VXX0&callback=initMap" } });
});