/* ==========================================================================
   16311 RECOIL: SITE CONTENT
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit for words, names, links, and results.
   Photos are separate: just drop image files into the "photos" folder
   (see README.md for the exact file names).

   QUICK RULES
   - Text goes inside "quote marks". Keep the commas at the end of each line.
   - If you need a quote mark INSIDE text, put a backslash first:  \"like this\"
   - Lines starting with // are notes for humans. The website ignores them.
   - If the site ever shows a red "content.js has a problem" box, you most
     likely deleted a comma, a quote mark, or a bracket. Undo the last edit.
   ========================================================================== */

window.SITE = {

  /* ---------- Settings ---------- */
  settings: {
    // true  = empty photo spots show a dashed "add photo here" box (good while building).
    // false = empty photo spots are hidden, so the public site never shows gaps.
    showEmptyPhotoSlots: false,
  },

  /* ---------- Team basics (used all over the site) ---------- */
  team: {
    name: "Recoil",
    number: "16311",
    program: "Vandegrift ViperBots",
    programUrl: "https://viperbots.org/",
    firstUrl: "https://www.firstinspires.org/",
    school: "Vandegrift High School",
    place: "Austin, Texas",
    email: "recoil16311@gmail.com",
    instagram: "https://www.instagram.com/16311recoil/",
    linkedin: "https://www.linkedin.com/in/recoil-robotics-079b45338/",
    mapQuery: "Vandegrift High School Austin TX",
  },

  /* ---------- Top of the page ---------- */
  hero: {
    tagline: "One of ten ViperBots FTC teams at Vandegrift High School in Austin, Texas.",
    hint: "Go ahead, pull a letter.",
  },

  /* ---------- Who we are ---------- */
  about: {
    title: "Who we are",
    lead: "16311 Recoil is one of the 10 award-winning FTC teams in the ViperBots Robotics Program at Vandegrift High School in Austin, Texas. We aspire to increase our skills in STEM (science, technology, engineering, and mathematics), while sharing our knowledge within our community and with young, passionate students around the world.",
    ftcTitle: "FTC & FIRST",
    ftcText: "Team 16311 is a competitive robotics team in the FIRST Tech Challenge (FTC). FTC is one of the four tiers of FIRST (For Inspiration and Recognition of Science and Technology), a nonprofit that “prepares young people for the future.” The FIRST Tech Challenge inspires students to “think like engineers” through a competitive robot game in which teams design, build, and program robots.",
    valueTitle: "Gracious Professionalism",
    valueText: "One of FIRST's key values. We define it as uplifting other teams by leveling the playing field, so everyone has the same opportunities and resources to succeed that we do.",
    // Team members, subteams, and seasons are counted automatically.
    // Add anything else you want in the number strip here, e.g. { value: "10", label: "FTC teams in the ViperBots program" }
    extraStats: [
      { value: "10", label: "FTC teams in the ViperBots program" },
    ],
  },

  /* ---------- Our team ---------- */
  teamSection: {
    title: "Meet Team 16311",
    intro: "Our team is made up of hardworking, dedicated members, from freshmen to seniors. We are organized into three subteams: hardware, software, and marketing. Everyone is versatile across all three, but each member has one primary role for the season.",
    missionTitle: "Our mission",
    mission: "Our mission is to inspire students around the world to expand their knowledge in the fields of STEM through enriching educational and collaborative sessions, while increasing our own skills by working and learning from STEM professionals. We aspire to leave a lasting impact on those in our community by sharing our knowledge with others and establishing long-standing relationships with STEM professionals and young people around the globe.",
  },

  // team: must be "hardware", "software", or "marketing".
  // Photo file for each person is photos/team/<first name in lowercase>.jpg
  // (or set  photo: "team/some-other-name"  to use a different file name).
  roster: [
    { name: "Katya",     team: "software",  titles: ["Co-Captain", "Software Lead"] },
    { name: "Sunaina",   team: "marketing", titles: ["Co-Captain", "Marketing Lead"] },
    { name: "John",      team: "hardware",  titles: ["Hardware Lead"] },
    { name: "Alexander", team: "hardware",  titles: ["Hardware Member"] },
    { name: "Caitlyn",   team: "hardware",  titles: ["Hardware Member"] },
    { name: "Ben",       team: "hardware",  titles: ["Hardware Member"] },
    { name: "Konnor",    team: "hardware",  titles: ["Hardware Member"] },
    { name: "Ayaan",     team: "software",  titles: ["Software Member"] },
    { name: "Andrew",    team: "marketing", titles: ["Marketing Member"] },
    { name: "Saanvi",    team: "marketing", titles: ["Marketing Member"] },
  ],

  /* ---------- Our robot ---------- */
  robotSection: {
    title: "Our robot",
    intro: "A look at the robots we have built, season by season.",
  },

  // This season. Add a sentence or two in "text" whenever you want one; leave it "" to hide it.
  // Photos: photos/robot/current-1.jpg, current-2.jpg, current-3.jpg
  currentSeason: {
    name: "BioBuzz",
    years: "2026-2027",
    text: "",
  },

  /* ---------- Our legacy (results). Newest season first. ----------
     awards: write as "Award name, placement", e.g. "Inspire Award, 1st place".
             Placements containing 1st/Winner = gold, 2nd = silver, 3rd = bronze.
     notes:  anything else worth saying about that event (rank, record, alliance).
     Photos for the robot page use the season name and years, e.g.
     photos/robot/decode-2025-2026.jpg  */
  seasons: [
    {
      game: "Decode", years: "2025-2026",
      events: [
        { name: "AML Championship", awards: ["Innovate Award, Winner"], notes: [] },
        { name: "Semi-Regionals",
          awards: ["Innovate Award, Winner"],
          notes: ["Winning alliance, 1st pick", "3rd place in qualifications", "Record 4-1-0"] },
        { name: "Regionals",
          awards: ["Sustain Award, 3rd place"],
          notes: ["Division finalist alliance, 1st pick", "13th place in qualifications", "Record 3-3-0"] },
        { name: "FIRST State Championships",
          awards: [],
          notes: ["7th place in qualifications", "Record 3-2-0"] },
      ],
    },
    {
      game: "Into the Deep", years: "2024-2025",
      events: [
        { name: "Siri League Meet 1",     awards: [], notes: ["10th place in qualifications", "Record 2-4-0"] },
        { name: "Austin Scrimmage 2",     awards: [], notes: ["10th place in qualifications", "Record 2-3-0"] },
        { name: "Siri League Meet 2",     awards: [], notes: ["10th place in qualifications", "Record 2-4-0"] },
        { name: "Alexa League Meet 3",    awards: [], notes: ["8th place in qualifications", "Record 3-3-0"] },
        { name: "League Tournament",
          awards: ["Think Award, 2nd place"],
          notes: ["12th place in qualifications", "Record 2-2-1"] },
      ],
    },
    {
      game: "Center Stage", years: "2023-2024",
      events: [
        { name: "AML Championship",          awards: ["Innovate Award, 1st place"], notes: [] },
        { name: "Semi-Regionals",            awards: ["Inspire Award, 1st place"],  notes: [] },
        { name: "Regionals",                 awards: ["Inspire Award, 1st place"],  notes: [] },
        { name: "FIRST State Championships", awards: ["Connect Award, 2nd place"],  notes: [] },
      ],
    },
    {
      game: "Power Play", years: "2022-2023",
      events: [
        { name: "AML Championship", awards: ["Control Award, 1st place"], notes: [] },
        { name: "Semi-Regionals",   awards: ["Inspire Award, 2nd place"], notes: [] },
        { name: "Regionals",        awards: ["Innovate Award, 1st place"], notes: [] },
      ],
    },
    {
      game: "Freight Frenzy", years: "2021-2022",
      events: [
        { name: "AML Championship",          awards: ["Inspire Award, 1st place"],  notes: [] },
        { name: "Texas Central Championship", awards: ["Innovate Award, 1st place"], notes: ["Robot game semi-finalist"] },
      ],
    },
    {
      game: "Ultimate Goal", years: "2020-2021",
      events: [
        { name: "AML Championship", awards: ["Control Award, 3rd place"], notes: [] },
      ],
    },
    {
      game: "Skystone", years: "2019-2020",
      events: [
        { name: "AML Championship", awards: ["Control Award, 3rd place"], notes: [] },
      ],
    },
  ],

  legacySection: {
    title: "Our legacy",
    intro: "Every season at a glance: where we competed, how we ranked, and the awards we brought home.",
  },

  /* ---------- Photo gallery (hides itself if count is 0) ----------
     Photos: photos/gallery/1.jpg, 2.jpg, 3.jpg ... up to "count".
     Optional captions line up with the photo numbers. */
  gallery: {
    title: "Team moments",
    intro: "Moments from build nights, competitions, and outreach.",
    count: 6,
    captions: [],
  },

  /* ---------- Expanding STEM (outreach) ----------
     Photos: photos/outreach/<id>.jpg
     "stat" is optional: a big number that appears on the card. */
  stemSection: {
    title: "Expanding STEM",
    intro: "Where we have taken our robot and our experience into the community.",
  },
  outreach: [
    { id: "roboeagles", title: "Mentoring Roboeagles 21816", featured: true,
      text: "We worked with Roboeagles, a rookie community FTC team, on hardware, software, and marketing. We shared our processes, materials, and resources, and met with them in person on Mondays and Fridays." },
    { id: "canyon-ridge", title: "Canyon Ridge Middle School",
      stat: { value: "31", label: "students in grades K-5" },
      text: "We gave students a hands-on look at what FIRST and FTC are all about. They drove our robot themselves, and we talked through what a competition day looks like: the matches, the strategy, the energy in the room. We were also working to help launch a new FLL team at the school. The goal was simple: spark curiosity about STEM early and show these kids that FIRST is something they can be part of." },
    { id: "primrose", title: "Primrose Elementary",
      stat: { value: "27", label: "students in grades K-5" },
      text: "We introduced students to FIRST and FTC, explained what the program is, and showed how our team competes. We brought our robot and let students drive it, which turned out to be the highlight of the visit. Combined with our effort to help stand up a new FLL team at the school, we wanted to leave them excited about STEM and thinking about how they might get involved with FIRST down the road." },
    { id: "four-points", title: "Four Points Middle School",
      stat: { value: "30", label: "students in grades K-5" },
      text: "We explained what FIRST is, walked students through what competitions are like, and let them get hands-on by driving our robot. It was part of a broader push to help launch a new FLL team at the school and inspire the next generation to see themselves in STEM." },
    { id: "goddard", title: "The Goddard School",
      text: "The Goddard School is an early childhood education provider with more than 500 franchised schools in 37 states. Our purpose was to inspire young students and introduce them to STEM. It was very rewarding for our team and for the students we met. They were excited to learn what we had to share, and by the end of the day they were all interested in, and determined to take part in, robotics." },
    { id: "steiner-ranch", title: "Steiner Ranch Elementary STEAM Night", featured: true,
      stat: { value: "100+", label: "students and their families" },
      text: "Steiner Ranch Elementary is in Austin, Texas, in Leander ISD, and is one of the five elementary schools that feed into our high school. We were excited to join their annual STEAM Night and make a lasting impact on our community. We shared our experience in FIRST and our knowledge of STEAM. It meant even more because it was the first time in almost two years that students could do a hands-on activity like this, after the pandemic." },
  ],

  /* ---------- Upcoming events (optional) ----------
     Leave the list empty ( [] ) and this section disappears.
     Example:  { date: "Dec 14, 2026", name: "League Meet 1", place: "Austin, TX", note: "Come cheer us on." }  */
  eventsSection: {
    title: "Come see us compete",
    intro: "Dates and places for our next events.",
  },
  events: [],

  /* ---------- Sponsors and supporters (optional) ----------
     Logo files: photos/sponsors/<id>.png (png, svg, jpg, jpeg, and webp all work).
     Leave the list empty ( [] ) and the section disappears.
     Example:  { id: "acme", name: "Acme Robotics", url: "https://example.com" }  */
  sponsorsSection: {
    title: "Thank you to our sponsors",
    intro: "These businesses and families keep our robot moving.",
    // Shown while you are still building: how many empty logo boxes to display
    // if the list below is empty and showEmptyPhotoSlots is true.
    emptyPreviewCount: 4,
  },
  sponsors: [],

  /* ---------- Mini game ----------
     Set enabled to false to remove the game (and its menu link) completely. */
  game: {
    enabled: true,
    title: "Play Viper Recoil",
    intro: "Our robot fires a viper coiled like a spring. Pull back, let go, and drop it in the charmer's basket. Land on a snake spring for a bounce. How high can you score?",
    launches: 10,
    help: "Drag back from the robot and let go. On a keyboard, use the up and down arrows to aim, left and right to set power, and space to launch. Clean strikes and streaks score extra.",
  },

  /* ---------- Contact ---------- */
  contactSection: {
    title: "Contact us",
    intro: "Questions about the team, a visit to your school, or working together? Email us or find us on social media.",
    mapTitle: "Find us at Vandegrift High School",
  },
};
