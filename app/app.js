const express = require('express');
const app = express();
const PORT = 3000

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) =>
{
	res.render('layout.ejs', { title: "Map", mainContent: "pages/map", includeParams: { API_URL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDx1nDqigjyOixfMY4kj485EaIkEi1VXX0&loading=async&callback=initMap" } });
});

// Handler for when page is not found
app.use((req, res) => {
		res.status(404).send("Page Not Found");
	}
);

app.listen(PORT, () =>
{
	console.log('Server running on http://localhost:' + PORT);
});