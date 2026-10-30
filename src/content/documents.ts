import { paginate } from './paginate';

// French documents keep the original text and add the English subtitle as `translation`, as the script asks.
// doc_marc_notebook_restored is the notebook with the extra line the script adds when cupboard_restored is set.
// The prologue pages, board posts, and Yannick's school page belong to the desktop agent and are not here.

export interface DocumentSource {
  title: string;
  /** Each entry starts a new page. Line breaks are the line breaks on the page. */
  text: string | string[];
  translation?: string | string[];
}

export interface Document {
  title: string;
  pages: string[];
  translation?: string[];
}

const sources = {
  doc_postcard_calvi: {
    title: 'Postcard from Calvi',
    text: `Gilles, salut.
Il fait 35 degrés. On saute d'avions toute la
journée, c'est mieux que les vaches.
Ici je m'appelle autrement. C'est mieux comme ça.
Dis rien à ma mère. Dis rien à personne.
Bois une bière pour moi au Croix-Blanche.
                                     Marc`,
    translation: `Gilles, hi. It's 35 degrees. We jump out of planes all day, it's better than cows. Here I go by another name. It's better that way. Don't tell my mother. Don't tell anyone. Have a beer for me at the Croix-Blanche. Marc`,
  },
  doc_gremaud_diary: {
    title: "Gremaud's diary, 1996",
    text: `Mardi 9 janvier       BN
Vendredi 12 janvier   BN. Couvertures.
Mardi 16 janvier      BN
Lundi 4 mars          Dr Pittet, Romont. Cœur. Pilules.
Vendredi 19 avril     BN. D.M. sait. Bien.
Mercredi 19 juin      Thérèse. 6h. Prévenir l'abbé.
Samedi 22 juin        Enterrement Thérèse 10h.
                      BN le soir. Dur.
Vendredi 2 août       BN. Batterie voiture.
Mardi 12 novembre     Confession.
Dimanche 8 décembre   Daniel.
Jeudi 12 décembre     Enterrement Daniel 14h.
                      BN. Il n'a pas parlé.
Mardi 24 décembre     BN. Bougies, fromage, une
                      bouteille. Messe de minuit
                      après.
Mardi 31 décembre     BN. Bonne année, mon grand.`,
    translation: `Tuesday 9 January     BN
Friday 12 January     BN. Blankets.
Monday 4 March        Dr Pittet, Romont. Heart. Pills.
Friday 19 April       BN. D.M. knows. Good.
Wednesday 19 June     Thérèse. 6 am. Tell the abbé.
Saturday 22 June      Thérèse's funeral 10 am. BN in
                      the evening. Hard.
Friday 2 August       BN. Car battery.
Tuesday 12 November   Confession.
Sunday 8 December     Daniel.
Thursday 12 December  Daniel's funeral 2 pm. BN. He
                      didn't speak.
Tuesday 24 December   BN. Candles, cheese, a bottle.
                      Midnight mass after.
Tuesday 31 December   BN. Happy new year, my boy.`,
  },
  doc_odile_clipping: {
    title: 'Clipping on the fridge',
    text: `LE JOURNAL DU PLATEAU          Mardi 21 janvier 1997

LEURS
Le syndic toujours introuvable

Les recherches pour retrouver Jean-Pierre Gremaud, 64 ans,
syndic de Leurs depuis 1971, ont été suspendues dimanche.
Pompiers, gendarmes et habitants de trois communes ont
fouillé pendant cinq jours les bords de la rivière et les
forêts voisines, sous d'importantes chutes de neige. M.
Gremaud avait quitté son domicile le 14 janvier vers 22 h,
à pied. Son épouse indique qu'il voulait « contrôler le
bois de la commune ». La gendarmerie n'exclut aucune
hypothèse.`,
    translation: `LE JOURNAL DU PLATEAU, Tuesday 21 January 1997. LEURS. Syndic still missing. The search for Jean-Pierre Gremaud, 64, syndic of Leurs since 1971, was called off on Sunday. Firefighters, gendarmes, and residents of three communes searched the riverbanks and nearby forests for five days, in heavy snow. Mr Gremaud left his home on foot at about 10 pm on 14 January. His wife says he wanted to 'check on the commune's timber'. The gendarmerie is not ruling anything out.`,
  },
  doc_laiterie_board: {
    title: 'Notices at the laiterie',
    text: `MISE DE BÉTAIL - Romont, jeudi 26 novembre, 9h
CHŒUR MIXTE - répétition mardi 20h, salle paroissiale.
   Nous cherchons des ténors !!!
PERDU chat tigré, répond à « Minet ». Famille Kolly.
À VENDRE pneus d'hiver 165/70 R13, presque neufs.
   S'adresser au Garage Dousse.
COMMUNE DE LEURS - Le cimetière est fermé de 21h à 7h.
   Le Conseil communal
BABY-SITTING - Sandrine, 15 ans, sérieuse. Tél. 652 41 18`,
    translation: `CATTLE AUCTION, Romont, Thursday 26 November, 9 am. MIXED CHOIR: rehearsal Tuesday 8 pm, parish hall. We need tenors!!! LOST: tabby cat, answers to 'Minet'. Kolly family. FOR SALE: winter tyres 165/70 R13, nearly new. Ask at Garage Dousse. COMMUNE OF LEURS: The cemetery is closed from 9 pm to 7 am. The commune council. BABYSITTING: Sandrine, 15, reliable.`,
  },
  doc_gremaud_letter: {
    title: 'Letter in the coffin',
    text: `Leurs, le 17 novembre 1995

À qui ouvrira ce cercueil,

Si vous lisez ceci, c'est que vous n'avez pas cru à sa
mort. Vous aviez raison.

Marc Chassot est vivant. Il est revenu de la guerre à
pied, à la fin d'octobre, blessé au visage et aux mains,
et blessé ailleurs aussi, là où ça ne se voit pas. Il ne
veut pas être vu. Il ne veut pas être retrouvé. Je l'ai
caché. Demain nous enterrerons ce cercueil vide et tout le
village pleurera un mort qui n'est pas mort. Que Dieu me
pardonne, je ne sais pas faire autrement.

Il vit dans l'ancien fort du Bois-Noir. La clé ci-jointe
ouvre la dernière pièce, le K.P. 3, derrière l'armoire du
dortoir. J'ai l'autre.

Je mets cette lettre ici parce que mon cœur est fatigué et
que je suis le seul à savoir. Si vous la lisez, c'est peut-
être que je ne suis plus là pour monter le pain. Alors c'est
à vous.

Frappez trois fois, attendez, puis une fois. Il saura que
c'est un ami. N'arrivez jamais derrière lui. Ne criez pas.
N'allumez pas de lampe dans ses yeux. Apportez du pain.

Il n'est pas dangereux. Il est blessé.

Quand il ne supporte plus les murs, nous montons nous
asseoir sous le mélèze, au-dessus du fort. De là, quand il
n'y a pas de brouillard, on voit tout le village.

Ne dites rien à ma femme. Elle n'y est pour rien.

C'est mon filleul. Je lui ai tenu la tête sur les fonts
baptismaux. Je ne le laisserai pas seul.

Jean-Pierre Gremaud
syndic`,
    translation: `Leurs, 17 November 1995

To whoever opens this coffin,

If you are reading this, you did not believe he was dead.
You were right.

Marc Chassot is alive. He came back from the war on foot at
the end of October, wounded in the face and hands, and
wounded elsewhere too, where it doesn't show. He doesn't
want to be seen. He doesn't want to be found. I have hidden
him. Tomorrow we will bury this empty coffin and the whole
village will mourn a dead man who is not dead. God forgive
me, I don't know what else to do.

He lives in the old Bois-Noir fort. The key with this letter
opens the last room, K.P. 3, behind the cupboard in the
dormitory. I have the other one.

I am leaving this letter here because my heart is tired and
I am the only one who knows. If you are reading it, perhaps
I am no longer here to carry up the bread. Then it is up to
you.

Knock three times, wait, then once. He will know it is a
friend. Never come up behind him. Don't shout. Don't shine a
light in his eyes. Bring bread.

He is not dangerous. He is hurt.

When he can't bear the walls any more, we go up and sit
under the larch above the fort. From there, when there is no
fog, you can see the whole village.

Say nothing to my wife. She has no part in this.

He is my godson. I held his head over the font. I will not
leave him alone.

Jean-Pierre Gremaud
syndic`,
  },
  doc_legion_tag: {
    title: 'Identity disc',
    text: `CHALLAND M.
1958
172493
LE`,
    translation: `An identity disc. 'CHALLAND M., 1958, 172493, LE.' LE could be Légion étrangère, the Foreign Legion.`,
  },
  doc_marc_notebook: {
    title: "Marc's notebook",
    text: [
      `1.I.98
BROUILLARD. RIEN. RONDE R. 21H-2H.
BOUGIE CHEZ D. SAMEDI.

(sketch: a lantern)`,
      `3.X.98
OEUFS CHEZ YERLY: 2. LAISSÉ 5 FR.
LE GARÇON DE L'AUBERGE À SA FENÊTRE. 3H.
IL ME REGARDE. JE LE REGARDE.

(sketch: a window with a small figure in it)`,
      `17.XI.98
QUELQU'UN D'AILLEURS. BUS DE 16H20. AUBERGE.
CHEZ L'ABBÉ UNE HEURE.

17.XI.98 NUIT
LA LAMPE LIT LES PIERRES. UNE PAR UNE.
RAYMOND. BARI M'A SENTI, N'A RIEN DIT.
JE ME SUIS MONTRÉ AU MUR. POURQUOI ?
JE NE SAIS PAS.
LA LAMPE M'A SUIVI. PORTE CALÉE.

(sketch: a figure with a torch among gravestones, the face left blank)`,
      `18.XI.98
PORTE OUVERTE. POUR QUE LA LAMPE VOIE.
POURQUOI ? JE NE SAIS PAS NON PLUS.
LA LAMPE A TROUVÉ L'ARMOIRE.
QUATRE MINUTES DANS LA SALLE DES MASQUES.

(sketch: the pile of masks, and a small blank-faced figure beside it)`,
      `18.XI.98 NUIT
LA LAMPE CREUSE. JE REGARDE DEPUIS LE MUR.
JE NE L'ARRÊTE PAS.
LA BOÎTE EST FAITE POUR ÇA. J-P L'AVAIT DIT.

(sketch: a figure in a hole, a spade, the face blank)`,
      `19.XI.98
LA LAMPE EST MONTÉE AU MÉLÈZE.
ELLE CROIT QUE JE L'AI TUÉ.
PEUT-ÊTRE QUE C'EST JUSTE.

(sketch: a larch tree, and nothing under it)`,
    ],
    translation: [
      `1 January 98. Fog. Nothing. R.'s round 9 pm to 2 am. Candle at D.'s on Saturday.`,
      `3 October 98. Eggs at Yerly's: 2. Left 5 francs. The boy from the inn at his window. 3 am. He watches me. I watch him.`,
      `17 November 98. Someone from elsewhere. The 16:20 bus. The inn. With the abbé for an hour.

17 November 98, night. The torch reads the stones. One by one. Raymond. Bari smelled me, said nothing. I showed myself at the wall. Why? I don't know. The torch followed me. Door wedged.`,
      `18 November 98. Door open. So the torch would see. Why? I don't know that either. The torch found the cupboard. Four minutes in the mask room.`,
      `18 November 98, night. The torch is digging. I watch from the wall. I don't stop it. The box was made for this. J-P said so.`,
      `19 November 98. The torch went up to the larch. It thinks I killed him. Maybe that's fair.`,
    ],
  },
  doc_marc_notebook_restored: {
    title: "Marc's notebook",
    text: [
      `1.I.98
BROUILLARD. RIEN. RONDE R. 21H-2H.
BOUGIE CHEZ D. SAMEDI.

(sketch: a lantern)`,
      `3.X.98
OEUFS CHEZ YERLY: 2. LAISSÉ 5 FR.
LE GARÇON DE L'AUBERGE À SA FENÊTRE. 3H.
IL ME REGARDE. JE LE REGARDE.

(sketch: a window with a small figure in it)`,
      `17.XI.98
QUELQU'UN D'AILLEURS. BUS DE 16H20. AUBERGE.
CHEZ L'ABBÉ UNE HEURE.

17.XI.98 NUIT
LA LAMPE LIT LES PIERRES. UNE PAR UNE.
RAYMOND. BARI M'A SENTI, N'A RIEN DIT.
JE ME SUIS MONTRÉ AU MUR. POURQUOI ?
JE NE SAIS PAS.
LA LAMPE M'A SUIVI. PORTE CALÉE.

(sketch: a figure with a torch among gravestones, the face left blank)`,
      `18.XI.98
PORTE OUVERTE. POUR QUE LA LAMPE VOIE.
POURQUOI ? JE NE SAIS PAS NON PLUS.
LA LAMPE A TROUVÉ L'ARMOIRE.
QUATRE MINUTES DANS LA SALLE DES MASQUES.
ELLE L'A REMISE EN PLACE. PRUDENTE.

(sketch: the pile of masks, and a small blank-faced figure beside it)`,
      `18.XI.98 NUIT
LA LAMPE CREUSE. JE REGARDE DEPUIS LE MUR.
JE NE L'ARRÊTE PAS.
LA BOÎTE EST FAITE POUR ÇA. J-P L'AVAIT DIT.

(sketch: a figure in a hole, a spade, the face blank)`,
      `19.XI.98
LA LAMPE EST MONTÉE AU MÉLÈZE.
ELLE CROIT QUE JE L'AI TUÉ.
PEUT-ÊTRE QUE C'EST JUSTE.

(sketch: a larch tree, and nothing under it)`,
    ],
    translation: [
      `1 January 98. Fog. Nothing. R.'s round 9 pm to 2 am. Candle at D.'s on Saturday.`,
      `3 October 98. Eggs at Yerly's: 2. Left 5 francs. The boy from the inn at his window. 3 am. He watches me. I watch him.`,
      `17 November 98. Someone from elsewhere. The 16:20 bus. The inn. With the abbé for an hour.

17 November 98, night. The torch reads the stones. One by one. Raymond. Bari smelled me, said nothing. I showed myself at the wall. Why? I don't know. The torch followed me. Door wedged.`,
      `18 November 98. Door open. So the torch would see. Why? I don't know that either. The torch found the cupboard. Four minutes in the mask room. It put it back. Careful one.`,
      `18 November 98, night. The torch is digging. I watch from the wall. I don't stop it. The box was made for this. J-P said so.`,
      `19 November 98. The torch went up to the larch. It thinks I killed him. Maybe that's fair.`,
    ],
  },
  doc_gremaud_notes: {
    title: "Gremaud's notes",
    text: [
      `Mardi.
Pain, fromage, piles, le journal.
Ne sors pas de jour cette semaine, les chasseurs sont dans
le Bois-Noir jusqu'à dimanche.
J-P`,
      `Vendredi.
Ta mère a demandé à l'abbé s'il priait pour toi. Elle va mal.
Réfléchis. Je peux lui dire. Je peux l'amener.
J-P`,
      `19 juin.
Ta mère est partie ce matin. Elle n'a pas souffert. Elle
avait ta photo de communion sur la table de nuit.
L'enterrement est samedi à 10 heures.
Je suis désolé, mon grand.
J-P`,
      `Daniel est venu me voir. Il sait. Il ne dira rien. Laisse-
le venir le dimanche, ça te fera du bien. À lui aussi.
J-P`,
      `Décembre.
Daniel.
Je ne sais pas quoi t'écrire. Je viens demain soir. Ne fais
pas de bêtise. Attends-moi.
J-P`,
      `Le docteur dit que mon cœur est fatigué. Si un jour je ne
viens pas, ne m'attends pas. Il y a de quoi tenir deux mois
sur l'étagère. Et tu sais où est la boîte.
J-P`,
    ],
    translation: [
      `Tuesday. Bread, cheese, batteries, the newspaper. Don't go out by day this week, the hunters are in Bois-Noir until Sunday. J-P`,
      `Friday. Your mother asked the abbé if he prays for you. She's not well. Think about it. I can tell her. I can bring her. J-P`,
      `19 June. Your mother passed away this morning. She didn't suffer. She had your communion photo on her bedside table. The funeral is on Saturday at 10. I'm sorry, my boy. J-P`,
      `Daniel came to see me. He knows. He won't say anything. Let him come on Sundays, it will do you good. Him too. J-P`,
      `December. Daniel. I don't know what to write to you. I'll come tomorrow night. Don't do anything stupid. Wait for me. J-P`,
      `The doctor says my heart is tired. If one day I don't come, don't wait for me. There's enough on the shelf for two months. And you know where the box is. J-P`,
    ],
  },
  photo_boys: {
    title: 'Marc and Dani, 1972',
    text: `Marc et Dani, 1972.

Samedi.`,
    translation: `Marc and Dani, 1972.

Saturday.`,
  },
  doc_ring: {
    title: 'The ring',
    text: `(inside the ring)
J-P - O  1958

(the slip)
POUR ODILE. UN JOUR.`,
    translation: `For Odile. One day.`,
  },
  doc_register_1995: {
    title: 'Burials, 1995',
    text: [
      `N° 5. Yerly née Bapst, Marie-Louise
Née le 2.2.1937
Décédée le 30.5.1995
Inhumée le 2.6.1995
Épouse de Bernard Yerly. Munie des sacrements.`,
      `N° 6. Kolly, Ernest
Né le 14.9.1909
Décédé le 21.10.1995
Inhumé le 24.10.1995
Doyen de la paroisse.`,
      `N° 7. Chassot, Marc Émile
Né le 3.4.1958
Décédé : août 1995, en Bosnie-Herzégovine, date exacte inconnue
Inhumé le 18.11.1995
Fils de feu Émile et de Thérèse née Kolly. Cercueil scellé remis par M. le syndic J.-P. Gremaud. Dépouille non présentée. Acte de décès : à suivre. Porteurs : B. Yerly, G. Dousse, R. Bapst, D. Menoud.`,
    ],
    translation: [
      `N° 5. Yerly née Bapst, Marie-Louise. Wife of Bernard Yerly. Received the sacraments.`,
      `N° 6. Kolly, Ernest. Oldest member of the parish.`,
      `N° 7. Chassot, Marc Émile. Born 3 April 1958. Died August 1995 in Bosnia-Herzegovina, exact date unknown. Buried 18 November 1995. Son of the late Émile and of Thérèse née Kolly. Sealed coffin handed over by the syndic, J.-P. Gremaud. Remains not shown. Death certificate: to follow. Bearers: B. Yerly, G. Dousse, R. Bapst, D. Menoud.`,
    ],
  },
  doc_register_1996: {
    title: 'Burials, 1996',
    text: [
      `N° 3. Chassot née Kolly, Thérèse
Née le 11.3.1931
Décédée le 19.6.1996
Inhumée le 22.6.1996
Veuve d'Émile. Inhumée dans la tombe de famille, auprès de son fils.`,
      `N° 9. Menoud, Daniel Pierre
Né le 7.7.1958
Décédé le 8.12.1996
Inhumé le 12.12.1996
Funérailles chrétiennes célébrées. « Je suis la résurrection et la vie. »`,
    ],
    translation: [
      `N° 3. Chassot née Kolly, Thérèse. Widow of Émile. Buried in the family grave, beside her son.`,
      `N° 9. Menoud, Daniel Pierre. Christian funeral celebrated. 'I am the resurrection and the life.'`,
    ],
  },
  doc_register_1997: {
    title: 'Burials, 1997',
    text: [
      `Bapst, Léa. 4.3.1997. 7.3.1997. 9.3.1997. Ondoyée.

Python, Joseph, 1911 - 1997`,
      `Gremaud, Jean-Pierre, syndic. Né le 2.5.1932.
Disparu le 14 janvier 1997.
Pas d'inhumation.
Pierre commémorative bénie le 1er novembre 1997, à la
demande de son épouse.`,
    ],
    translation: [
      `Bapst, Léa. 4.3.1997. 7.3.1997. 9.3.1997. Emergency baptism.

Python, Joseph, 1911 - 1997`,
      `Gremaud, Jean-Pierre, syndic. Born 2 May 1932. Disappeared 14 January 1997. No burial. Memorial stone blessed on 1 November 1997 at his wife's request.`,
    ],
  },
  doc_register_baptisms_1958: {
    title: 'Baptisms, 1958',
    text: [
      `N° 8. Chassot, Marc Émile
Né le 3.4.1958, baptisé le 6.4.1958
Parents : Émile Chassot et Thérèse née Kolly
Parrain et marraine : Jean-Pierre Gremaud, Odile Gremaud née Python`,
      `N° 14. Menoud, Daniel Pierre
Né le 7.7.1958, baptisé le 13.7.1958
Parents : Pierre Menoud et Agnès née Clément
Parrain et marraine : Gilbert Dousse, Marthe Yerly`,
    ],
    translation: [
      `N° 8. Chassot, Marc Émile. Born 3 April 1958, baptized 6 April 1958. Parents: Émile Chassot and Thérèse née Kolly. Godfather and godmother: Jean-Pierre Gremaud, Odile Gremaud née Python.`,
      `N° 14. Menoud, Daniel Pierre. Born 7 July 1958, baptized 13 July 1958. Parents: Pierre Menoud and Agnès née Clément. Godfather and godmother: Gilbert Dousse, Marthe Yerly.`,
    ],
  },
  doc_chronicle: {
    title: 'Parish chronicle',
    text: [
      `1978
Mars. Le jeune Marc Chassot a quitté le village après la vente du bétail de feu son père. Sa mère ne dit pas où il est allé.`,
      `1994
Le Conseil communal a acquis de la Confédération l'ancien fort du Bois-Noir, que l'armée n'utilise plus. M. le syndic parle d'un dépôt pour la commune. On verra.`,
      `1995
Septembre. M. le syndic m'annonce la mort de Marc Chassot, tombé en ex-Yougoslavie. Je suis allé chez Thérèse. Elle m'a offert du café et n'a pas pleuré devant moi.

18 novembre. Sépulture de Marc Chassot. Beaucoup de monde, beaucoup de brouillard. Le cercueil venait de France, scellé. Que Dieu l'accueille, où qu'il soit.`,
      `1996
Juin. Thérèse Chassot nous a quittés. Elle repose auprès de son fils.

Décembre. Daniel Menoud. Je n'ai pas su voir. Seigneur, apprends-nous à voir.`,
      `1997
Janvier. M. le syndic Jean-Pierre Gremaud a disparu dans la nuit du 14. Cinq jours de recherches, la neige, les pompiers de trois communes. Rien. Je connais Jean-Pierre depuis trente ans.

Mars. Raymond Bapst signale que quelqu'un allume la lanterne sur la tombe de Daniel Menoud. Il ne voit jamais personne.

1er novembre. Bénédiction de la pierre à la mémoire de Jean-Pierre Gremaud. Odile était seule au premier rang. Je n'ai pas pu finir l'homélie.`,
      `1998
Les jeunes parlent d'un « Loyon » qui rôderait au Bois-Noir. Le Conseil a demandé à Raymond de faire une ronde au cimetière. Je prie chaque matin pour J.-P. et pour M.`,
    ],
    translation: [
      `1978
March. Young Marc Chassot left the village after selling his late father's cattle. His mother won't say where he has gone.`,
      `1994
The commune council bought the old Bois-Noir fort from the Confederation; the army no longer uses it. The syndic talks of a storeroom for the commune. We shall see.`,
      `1995
September. The syndic tells me Marc Chassot is dead, fallen in the former Yugoslavia. I went to Thérèse. She gave me coffee and did not cry in front of me.

18 November. Burial of Marc Chassot. Many people, much fog. The coffin came from France, sealed. May God receive him, wherever he is.`,
      `1996
June. Thérèse Chassot has left us. She rests beside her son.

December. Daniel Menoud. I did not know how to see it. Lord, teach us to see.`,
      `1997
January. The syndic Jean-Pierre Gremaud disappeared on the night of the 14th. Five days of searching, the snow, the fire brigades of three communes. Nothing. I have known Jean-Pierre for thirty years.

March. Raymond Bapst reports that someone lights the lantern on Daniel Menoud's grave. He never sees anyone.

1 November. Blessing of the stone in memory of Jean-Pierre Gremaud. Odile alone in the front pew. I could not finish the homily.`,
      `1998
The young people talk of a 'Loyon' who prowls in Bois-Noir. The council has asked Raymond to make a round at the cemetery. Every morning I pray for J.-P. and for M.`,
    ],
  },
  doc_church_bulletin: {
    title: 'Parish bulletin',
    text: `Samedi 21 novembre: messe anniversaire pour les défunts du mois.`,
    translation: `Saturday 21 November: anniversary mass for the dead of the month.`,
  },
  grave_menoud: {
    title: 'Daniel Menoud',
    text: `DANIEL MENOUD
7.7.1958 - 8.12.1996

Repose en paix, petit frère.`,
    translation: `Rest in peace, little brother.`,
  },
  grave_gremaud: {
    title: 'Jean-Pierre Gremaud',
    text: `À LA MÉMOIRE DE
JEAN-PIERRE GREMAUD
SYNDIC DE LEURS 1971 - 1997
né le 2.5.1932
disparu le 14.1.1997

Nous t'attendons.`,
    translation: `In memory of Jean-Pierre Gremaud. Syndic of Leurs 1971 to 1997. Born 2 May 1932. Disappeared 14 January 1997. We are waiting for you.`,
  },
  grave_chassot: {
    title: 'Famille Chassot',
    text: `FAMILLE CHASSOT

ÉMILE    1929 - 1977
THÉRÈSE née KOLLY    1931 - 1996

MARC    1958 - 1995
Tombé loin des siens.`,
    translation: `Chassot family. Émile 1929-1977. Thérèse née Kolly 1931-1996. Marc 1958-1995. Fallen far from his own.`,
  },
  grave_yerly_ml: {
    title: 'Marie-Louise Yerly-Bapst',
    text: `MARIE-LOUISE YERLY-BAPST
1937 - 1995
Ta bonté reste avec nous.`,
    translation: `Your kindness stays with us.`,
  },
  grave_kolly_ernest: {
    title: 'Ernest Kolly',
    text: `ERNEST KOLLY
1909 - 1995
Doyen de Leurs`,
    translation: `Oldest man in Leurs.`,
  },
  grave_bapst_lea: {
    title: 'Léa',
    text: `LÉA
4.3.1997 - 7.3.1997`,
  },
  grave_python_joseph: {
    title: 'Joseph Python',
    text: `JOSEPH PYTHON
1911 - 1997
Priez pour lui`,
    translation: `Pray for him.`,
  },
  grave_clement: {
    title: 'Famille Clément',
    text: `FAMILLE CLÉMENT
AGNÈS MENOUD-CLÉMENT 1930 - 1989`,
  },
  grave_overney_marie: {
    title: 'Marie Overney',
    text: `MARIE OVERNEY
1902 - 1984
Mère de notre curé`,
    translation: `Mother of our parish priest.`,
  },
  grave_rossier_andre: {
    title: 'André Rossier',
    text: `ANDRÉ ROSSIER
1944 - 1990
Aubergiste`,
    translation: `Innkeeper.`,
  },
  grave_misc_1: {
    title: 'Famille Grandjean',
    text: `FAMILLE GRANDJEAN

LOUIS 1898 - 1972
MARGUERITE 1903 - 1981`,
  },
  grave_misc_2: {
    title: 'Famille Kolly',
    text: `FAMILLE KOLLY

ALPHONSE 1907 - 1975`,
  },
  grave_misc_3: {
    title: 'Famille Yerly',
    text: `FAMILLE YERLY

JOSEPH 1912 - 1984
ROSE 1915 - 1988`,
  },
  grave_misc_4: {
    title: 'Famille Bapst',
    text: `FAMILLE BAPST

FRANÇOIS 1920 - 1979`,
  },
  grave_misc_5: {
    title: 'Famille Python',
    text: `FAMILLE PYTHON

MARIE 1909 - 1990`,
  },
  grave_misc_6: {
    title: 'Famille Dousse',
    text: `FAMILLE DOUSSE

GILBERT 1925 - 1986
ANNA 1928 - 1994`,
  },
  grave_misc_7: {
    title: 'Famille Clément',
    text: `FAMILLE CLÉMENT

PIERRE 1901 - 1977`,
  },
  grave_misc_8: {
    title: 'Famille Mauron',
    text: `FAMILLE MAURON

LOUISE 1918 - 1992`,
  },
  oldstone_1: {
    title: 'Old stone',
    text: `ICI REPOSE
ANNE-MARIE GRANDJEAN
GUÉRISSEUSE
1821 - 1887
ELLE SOIGNAIT LES AUTRES`,
    translation: `Here lies Anne-Marie Grandjean, healer, 1821-1887. She cared for others.`,
  },
  oldstone_2: {
    title: 'Old stone',
    text: `J. B. CHASSOT
SYNDIC
1798 - 1861`,
    translation: `J. B. Chassot, syndic.`,
  },
  oldstone_3: {
    title: 'Old stone',
    text: `... ENFANTS DE LA FAMILLE KOLLY
DIPHTÉRIE 1887`,
    translation: `...children of the Kolly family. Diphtheria, 1887.`,
  },
  oldstone_4: {
    title: 'Old stone',
    text: `(Unreadable. A cross and a skull, worn smooth.)`,
  },
  oldstone_5: {
    title: 'Old stone',
    text: `PRIEZ POUR NOUS QUI AVONS ÉTÉ CE QUE VOUS ÊTES`,
    translation: `Pray for us, who were what you are.`,
  },
  doc_forest_cross: {
    title: 'The cross under the larch',
    text: `J.-P. G.
14.I.1997`,
  },
} satisfies Record<string, DocumentSource>;

export type DocumentId = keyof typeof sources;

const toDocument = ({ title, text, translation }: DocumentSource): Document => ({
  title,
  pages: paginate(text),
  ...(translation === undefined ? {} : { translation: paginate(translation) }),
});

export const documents = Object.fromEntries(
  Object.entries(sources).map(([id, source]) => [id, toDocument(source)]),
) as Record<DocumentId, Document>;
