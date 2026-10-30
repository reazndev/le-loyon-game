import { page, type Pages } from '../page';

/** The weather office's text bulletin for the Plateau. */
export const weatherPages: Pages = {
  'http://www.sma.ch/text/plateau.html': page(
    'SMA - Plateau',
    2,
    `
<pre>
WEATHER BULLETIN FOR THE NORTH OF THE ALPS
Issued Monday 16.11.1998, 17:00

Plateau: stratus, top at 900 to 1100 m, no clearing
expected. Locally drizzle. Temperature 2 to 4 degrees.
Above the stratus: clear and mild.
Outlook Tuesday to Thursday: no change. Bise, weak.
</pre>
<hr>
SMA / ISM - Swiss Meteorological Institute`,
  ),
};
