import { page, type Pages } from '../page';

/**
 * Yannick's bookmarks on the inn computer: a motorbike site, his football club's fan page,
 * and the village page he made for school, which gives away who "yann" is.
 */
export const innBookmarkPages: Pages = {
  'http://members.netcity.ch/~leurs/': page(
    'Leurs - notre village',
    10,
    `
<center>
<h1>Leurs - notre village</h1>
<x-img src="church" w="200" h="150" alt="[eglise.jpg]"></x-img>
</center>
<ul>
<li>Habitants: 312</li>
<li>Altitude: 760 m</li>
<li>Église Saint-Maurice</li>
<li>Laiterie</li>
<li>Garage</li>
<li>Auberge de la Croix-Blanche</li>
</ul>
<hr>
<center>Page faite par Yannick R., 1997. Mise à jour: jamais.<br><br>
<x-counter digits="000087"></x-counter></center>`,
    { background: '#fff' },
  ),
  'http://www.motonet-romandie.ch/': page(
    'MotoNet Romandie',
    20,
    `
<center><x-img src="motonet-logo" alt="MotoNet Romandie"></x-img><br>
Le site des motards romands</center>
<hr>
<font color="#f0c818">OCCASIONS</font>
<table border="1" cellpadding="3" cellspacing="0" width="100%">
<tr><td>Sportive 600, 1994, 23'000 km, rouge</td><td>Fr. 6'500.-</td></tr>
<tr><td>Trail 350, 1991, pneus neufs</td><td>Fr. 2'900.-</td></tr>
<tr><td>Custom 750, 1996, comme neuve</td><td>Fr. 9'800.-</td></tr>
</table><br>
<font color="#f0c818">SORTIES</font><br>
Pas de sortie en novembre. Trop de brouillard. Rendez-vous au printemps!<br><br>
<x-broken w="88" h="31" alt="[Moto Shop]"></x-broken>`,
    { background: '#000', colors: { text: '#e8e8e8', link: '#ff6040', visited: '#d08060' } },
  ),
  'http://members.netcity.ch/~allezlesverts/': page(
    'Allez les Verts!',
    9,
    `
<center><span class="big">ALLEZ LES VERTS!</span><br>Supporters du FC Sarine-Ouest</center>
<x-marquee style="color:#ffe020">+++ Prochain match: samedi 14h30 contre le FC Haute-Broye +++ Tous au stade! +++</x-marquee>
<hr>
<table border="1" cellpadding="3" cellspacing="0" width="100%">
<tr><td>FC Sarine-Ouest - FC Glâne</td><td>2 - 1</td></tr>
<tr><td>US Gibloux - FC Sarine-Ouest</td><td>0 - 0</td></tr>
<tr><td>FC Sarine-Ouest - SC Veveyse</td><td>1 - 3</td></tr>
</table><br>
<center><x-gif name="construction"></x-gif><br>Photos bientot!</center>`,
    { background: '#1a5a2a', colors: { text: '#ffffff', link: '#ffe020', visited: '#d0d080' } },
  ),
};
