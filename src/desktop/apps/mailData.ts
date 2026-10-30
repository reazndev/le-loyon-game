/** The three messages in Courrier's inbox, newest first. Text from docs/script/01-prologue.md. */

export interface Mail {
  from: string;
  address: string;
  subject: string;
  received: string;
  date: string;
  body: string;
  /** Flag set when the message is opened. */
  sets?: string;
}

const spamNames = [
  'Darlene Pruitt, 4410 Old Mill Rd, Tulsa, OK 74105',
  'Gary W. Hensley, PO Box 2281, Bakersfield, CA 93303',
  'Mrs. Lorraine Tibbs, 77 Cedar Ct, Dayton, OH 45402',
  'Raymond Kolb, 1902 N. Ashland Ave, Peoria, IL 61604',
  'J. T. Marchetti, 330 Harbor View Dr, Erie, PA 16507',
  'Bonnie Strickland, Rt 3 Box 118, Florence, AL 35630',
  'Wendell Ames, 64 Birch Hollow, Bangor, ME 04401',
  'Cindy Oyler, 812 S. Main St Apt 4, Joplin, MO 64801',
  'Dale Fenstermacher, 21 Elk Run, Casper, WY 82601',
  'Trina Bouchard, 5507 Lakeshore Blvd, Duluth, MN 55804',
  'Earl Pettibone, 140 County Rd 9, Abilene, TX 79601',
  'Sharon K. Lutz, 9 Maple Terrace, Utica, NY 13501',
  'Vernon Gaskill, 2766 Pine St, Pocatello, ID 83201',
  'Lisa Marie Danko, 48 Ferry St, Bay City, MI 48706',
  'Harold "Buzz" Quigley, 1313 Ridge Ave, Wheeling, WV 26003',
  'Debra Yount, 600 E. 3rd St, Pueblo, CO 81003',
  'Arnold Szymanski, 77 Greenleaf Ln, Toledo, OH 43612',
  'Kathy Rae Bloom, 2101 Ocean Ave #12, Biloxi, MS 39530',
  'Melvin Ashcraft, 415 Hickory Dr, Paducah, KY 42001',
  'Patty Oberholtzer, 18 Church St, Lancaster, PA 17602',
  'Roy Delacroix, 3300 Bayou Rd, Houma, LA 70360',
  'Tammy Sue Harkins, 905 Walnut, Wichita, KS 67203',
  'Glen Ostrander, 52 Sawmill Rd, Rutland, VT 05701',
  'Rhonda Kingery, 1240 W. Pike, Clarksburg, WV 26301',
  'Floyd Bettencourt, 88 Front St, New Bedford, MA 02740',
];

export const mails: Mail[] = [
  {
    from: 'Ruth Aebischer',
    address: 'Ruth Aebischer <r.aebischer@lecho.ch>',
    subject: 'Strange Switzerland, Thursday deadline',
    received: '16.11.98 18:42',
    date: 'Mon, 16 Nov 1998 18:42:10 +0100',
    sets: 'pro_read_mail',
    body: `Hi,

As discussed. The Saturday supplement wants its
"strange Switzerland" page and I have nothing.
The cow-that-predicts-the-weather piece fell through
(the cow died, don't ask).

You said you had something about a man in a gas mask
near Fribourg. Fine. Go. Three days, train and one
room paid, keep the receipts. I want a person, a place,
a photo. If it's nothing, write me the fog and the
folklore and we'll run it small.

Call in by Saturday morning at the latest.

Before you go, find out which village it is and how
you get there.

R.

--
Ruth Aebischer
Rédaction / L'Écho`,
  },
  {
    from: 'info@millionaire-secrets.com',
    address: 'info@millionaire-secrets.com',
    subject: 'MAKE $$$ FAST - read this!!!',
    received: '15.11.98 03:12',
    date: 'Sun, 15 Nov 1998 03:12:44 -0500',
    body: `Dear Friend,

This is NOT a chain letter!!! In 1997 I was broke.
Today I own TWO houses. Send $5 to each of the 5
names below and put YOUR name at the bottom...

${spamNames.map((name, i) => `${i + 1}) ${name}`).join('\n')}

...AND THE MONEY WILL COME POURING IN!!!
Do NOT break the chain. A man in Ohio deleted this
letter and lost his job THE SAME WEEK.`,
  },
  {
    from: 'Photo Rapid',
    address: 'Photo Rapid <service@photo-rapid.ch>',
    subject: 'Your order is ready',
    received: '13.11.98 11:05',
    date: 'Fri, 13 Nov 1998 11:05:31 +0100',
    body: `Your film (24 exp.) is ready for collection.
Photo Rapid - open Mon-Fri 8.30-18.30, Sat 8.30-16.00`,
  },
];
