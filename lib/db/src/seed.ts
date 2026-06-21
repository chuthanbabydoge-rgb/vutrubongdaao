import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const { leaguesTable, teamsTable, playersTable, matchesTable, standingsTable } = schema;

const LEAGUES = [
  { name: "Premier League",        shortName: "EPL",  region: "Europe",        country: "England",       type: "club",     season: "2025/26", description: "Top flight of English football." },
  { name: "La Liga",               shortName: "LL",   region: "Europe",        country: "Spain",         type: "club",     season: "2025/26", description: "Spain's top professional football division." },
  { name: "Bundesliga",            shortName: "BL",   region: "Europe",        country: "Germany",       type: "club",     season: "2025/26", description: "Germany's premier football league." },
  { name: "Serie A",               shortName: "SA",   region: "Europe",        country: "Italy",         type: "club",     season: "2025/26", description: "Italy's top football competition." },
  { name: "Ligue 1",               shortName: "L1",   region: "Europe",        country: "France",        type: "club",     season: "2025/26", description: "France's premier football division." },
  { name: "UEFA Champions League", shortName: "UCL",  region: "Europe",        country: "Europe",        type: "club",     season: "2025/26", description: "Europe's most prestigious club tournament." },
  { name: "V.League 1",            shortName: "VL1",  region: "Asia",          country: "Vietnam",       type: "club",     season: "2025/26", description: "Vietnam's top professional football league." },
  { name: "J1 League",             shortName: "J1",   region: "Asia",          country: "Japan",         type: "club",     season: "2025/26", description: "Japan's top football division." },
  { name: "K League 1",            shortName: "KL1",  region: "Asia",          country: "South Korea",   type: "club",     season: "2025/26", description: "South Korea's premier football league." },
  { name: "MLS",                   shortName: "MLS",  region: "Americas",      country: "USA",           type: "club",     season: "2025/26", description: "Major League Soccer — USA & Canada." },
  { name: "Brasileirão",           shortName: "BSA",  region: "Americas",      country: "Brazil",        type: "club",     season: "2025/26", description: "Brazil's top football division." },
  { name: "Saudi Pro League",      shortName: "SPL",  region: "Asia",          country: "Saudi Arabia",  type: "club",     season: "2025/26", description: "Saudi Arabia's top football division." },
  { name: "CAF Champions League",  shortName: "CAF",  region: "Africa",        country: "Africa",        type: "club",     season: "2025/26", description: "Africa's premier club competition." },
  { name: "FIFA World Cup",        shortName: "WC",   region: "International", country: "International", type: "national", season: "2026",    description: "World's most prestigious national team tournament." },
  { name: "AFC Asian Cup",         shortName: "AAC",  region: "International", country: "Asia",          type: "national", season: "2027",    description: "Asia's premier national team competition." },
  { name: "Copa América",          shortName: "CA",   region: "International", country: "Americas",      type: "national", season: "2028",    description: "South America's premier national tournament." },
  { name: "UEFA Nations League",   shortName: "UNL",  region: "Europe",        country: "Europe",        type: "national", season: "2025/26", description: "UEFA biennial national competition." },
];

const TEAMS_BY_LEAGUE: Record<string, { name: string; shortName: string; country: string; stadiumName: string; founded: number; primaryColor: string; secondaryColor: string; type?: string; region?: string }[]> = {
  "Premier League": [
    { name: "Arsenal FC",             shortName: "ARS",  country: "England",      stadiumName: "Emirates Stadium",          founded: 1886, primaryColor: "#EF0107", secondaryColor: "#FFFFFF" },
    { name: "Chelsea FC",             shortName: "CHE",  country: "England",      stadiumName: "Stamford Bridge",           founded: 1905, primaryColor: "#034694", secondaryColor: "#FFFFFF" },
    { name: "Manchester City",        shortName: "MCI",  country: "England",      stadiumName: "Etihad Stadium",            founded: 1880, primaryColor: "#6CABDD", secondaryColor: "#1C2C5B" },
    { name: "Manchester United",      shortName: "MUN",  country: "England",      stadiumName: "Old Trafford",              founded: 1878, primaryColor: "#DA291C", secondaryColor: "#FBE122" },
    { name: "Liverpool FC",           shortName: "LIV",  country: "England",      stadiumName: "Anfield",                   founded: 1892, primaryColor: "#C8102E", secondaryColor: "#F6EB61" },
    { name: "Tottenham Hotspur",      shortName: "TOT",  country: "England",      stadiumName: "Tottenham Hotspur Stadium", founded: 1882, primaryColor: "#132257", secondaryColor: "#FFFFFF" },
    { name: "Aston Villa",            shortName: "AVL",  country: "England",      stadiumName: "Villa Park",                founded: 1874, primaryColor: "#95BFE5", secondaryColor: "#670E36" },
    { name: "Newcastle United",       shortName: "NEW",  country: "England",      stadiumName: "St. James' Park",           founded: 1892, primaryColor: "#241F20", secondaryColor: "#FFFFFF" },
  ],
  "La Liga": [
    { name: "Real Madrid CF",         shortName: "RMA",  country: "Spain",        stadiumName: "Santiago Bernabéu",         founded: 1902, primaryColor: "#FEBE10", secondaryColor: "#FFFFFF" },
    { name: "FC Barcelona",           shortName: "BAR",  country: "Spain",        stadiumName: "Spotify Camp Nou",          founded: 1899, primaryColor: "#A50044", secondaryColor: "#004D98" },
    { name: "Atletico de Madrid",     shortName: "ATL",  country: "Spain",        stadiumName: "Civitas Metropolitano",     founded: 1903, primaryColor: "#CB3524", secondaryColor: "#272E61" },
    { name: "Sevilla FC",             shortName: "SEV",  country: "Spain",        stadiumName: "Ramón Sánchez-Pizjuán",     founded: 1890, primaryColor: "#D2122E", secondaryColor: "#FFFFFF" },
    { name: "Real Sociedad",          shortName: "RSO",  country: "Spain",        stadiumName: "Reale Arena",               founded: 1909, primaryColor: "#003DA5", secondaryColor: "#FFFFFF" },
    { name: "Villarreal CF",          shortName: "VIL",  country: "Spain",        stadiumName: "Estadio de la Cerámica",    founded: 1923, primaryColor: "#FFE135", secondaryColor: "#004F9F" },
  ],
  "Bundesliga": [
    { name: "FC Bayern München",      shortName: "FCB",  country: "Germany",      stadiumName: "Allianz Arena",             founded: 1900, primaryColor: "#DC052D", secondaryColor: "#0066B2" },
    { name: "Borussia Dortmund",      shortName: "BVB",  country: "Germany",      stadiumName: "Signal Iduna Park",         founded: 1909, primaryColor: "#FDE100", secondaryColor: "#000000" },
    { name: "RB Leipzig",             shortName: "RBL",  country: "Germany",      stadiumName: "Red Bull Arena",            founded: 2009, primaryColor: "#DD0741", secondaryColor: "#0B1560" },
    { name: "Bayer 04 Leverkusen",    shortName: "B04",  country: "Germany",      stadiumName: "BayArena",                  founded: 1904, primaryColor: "#E32221", secondaryColor: "#000000" },
    { name: "Eintracht Frankfurt",    shortName: "SGE",  country: "Germany",      stadiumName: "Deutsche Bank Park",        founded: 1899, primaryColor: "#E1000F", secondaryColor: "#000000" },
  ],
  "Serie A": [
    { name: "Juventus FC",            shortName: "JUV",  country: "Italy",        stadiumName: "Allianz Stadium",           founded: 1897, primaryColor: "#000000", secondaryColor: "#FFFFFF" },
    { name: "AC Milan",               shortName: "MIL",  country: "Italy",        stadiumName: "San Siro",                  founded: 1899, primaryColor: "#FB090B", secondaryColor: "#000000" },
    { name: "Inter Milan",            shortName: "INT",  country: "Italy",        stadiumName: "San Siro",                  founded: 1908, primaryColor: "#010E80", secondaryColor: "#000000" },
    { name: "AS Roma",                shortName: "ROM",  country: "Italy",        stadiumName: "Stadio Olimpico",           founded: 1927, primaryColor: "#8E1F2F", secondaryColor: "#F5AA1C" },
    { name: "SSC Napoli",             shortName: "NAP",  country: "Italy",        stadiumName: "Diego Armando Maradona",    founded: 1926, primaryColor: "#12A0C7", secondaryColor: "#FFFFFF" },
  ],
  "Ligue 1": [
    { name: "Paris Saint-Germain",    shortName: "PSG",  country: "France",       stadiumName: "Parc des Princes",          founded: 1970, primaryColor: "#003F8A", secondaryColor: "#DA291C" },
    { name: "Olympique de Marseille", shortName: "OM",   country: "France",       stadiumName: "Stade Vélodrome",           founded: 1899, primaryColor: "#2CBFEF", secondaryColor: "#FFFFFF" },
    { name: "Olympique Lyonnais",     shortName: "OL",   country: "France",       stadiumName: "Parc OL",                   founded: 1950, primaryColor: "#0E3F8A", secondaryColor: "#DA291C" },
    { name: "AS Monaco",              shortName: "MON",  country: "Monaco",       stadiumName: "Stade Louis II",            founded: 1919, primaryColor: "#ED1C24", secondaryColor: "#FFFFFF" },
  ],
  "V.League 1": [
    { name: "Hà Nội FC",              shortName: "HAN",  country: "Vietnam",      stadiumName: "Hàng Đẫy",                  founded: 2007, primaryColor: "#FF0000", secondaryColor: "#FFFFFF" },
    { name: "Hoàng Anh Gia Lai",      shortName: "HAGL", country: "Vietnam",      stadiumName: "Pleiku",                    founded: 1999, primaryColor: "#FF6600", secondaryColor: "#FFFFFF" },
    { name: "SHB Đà Nẵng",            shortName: "DNT",  country: "Vietnam",      stadiumName: "Chi Lăng",                  founded: 1975, primaryColor: "#E30613", secondaryColor: "#000066" },
    { name: "Viettel FC",             shortName: "VTL",  country: "Vietnam",      stadiumName: "Hàng Đẫy",                  founded: 2009, primaryColor: "#CC0000", secondaryColor: "#FFFFFF" },
    { name: "TP.HCM FC",              shortName: "HCM",  country: "Vietnam",      stadiumName: "Thống Nhất",                founded: 2012, primaryColor: "#006633", secondaryColor: "#FFFFFF" },
    { name: "Bình Dương FC",          shortName: "BDN",  country: "Vietnam",      stadiumName: "Gò Đậu",                    founded: 1975, primaryColor: "#0000CC", secondaryColor: "#FFFFFF" },
  ],
  "Saudi Pro League": [
    { name: "Al Hilal SFC",           shortName: "HIL",  country: "Saudi Arabia", stadiumName: "Kingdom Arena",             founded: 1957, primaryColor: "#174094", secondaryColor: "#FFFFFF" },
    { name: "Al Nassr FC",            shortName: "NAS",  country: "Saudi Arabia", stadiumName: "Mrsool Park",               founded: 1955, primaryColor: "#F5AE13", secondaryColor: "#013EA4" },
    { name: "Al Ittihad Club",        shortName: "ITT",  country: "Saudi Arabia", stadiumName: "King Abdullah Sports City", founded: 1927, primaryColor: "#F5C400", secondaryColor: "#000000" },
    { name: "Al Ahli Saudi FC",       shortName: "AHL",  country: "Saudi Arabia", stadiumName: "King Abdullah Sports City", founded: 1937, primaryColor: "#006F3C", secondaryColor: "#FFFFFF" },
  ],
  "FIFA World Cup": [
    { name: "Brazil",      shortName: "BRA", country: "Brazil",      stadiumName: "Maracanã",                founded: 1914, primaryColor: "#009C3B", secondaryColor: "#FFDF00", type: "national", region: "Americas" },
    { name: "Argentina",   shortName: "ARG", country: "Argentina",   stadiumName: "Estadio Monumental",      founded: 1893, primaryColor: "#74ACDF", secondaryColor: "#FFFFFF",  type: "national", region: "Americas" },
    { name: "France",      shortName: "FRA", country: "France",      stadiumName: "Stade de France",         founded: 1919, primaryColor: "#002395", secondaryColor: "#FFFFFF",  type: "national", region: "Europe" },
    { name: "Germany",     shortName: "GER", country: "Germany",     stadiumName: "Allianz Arena",           founded: 1900, primaryColor: "#000000", secondaryColor: "#FFFFFF",  type: "national", region: "Europe" },
    { name: "Spain",       shortName: "ESP", country: "Spain",       stadiumName: "Estadio La Cartuja",      founded: 1909, primaryColor: "#AA151B", secondaryColor: "#F1BF00",  type: "national", region: "Europe" },
    { name: "England",     shortName: "ENG", country: "England",     stadiumName: "Wembley Stadium",         founded: 1863, primaryColor: "#FFFFFF",  secondaryColor: "#003090",  type: "national", region: "Europe" },
    { name: "Portugal",    shortName: "POR", country: "Portugal",    stadiumName: "Estádio da Luz",          founded: 1914, primaryColor: "#006600",  secondaryColor: "#FF0000",  type: "national", region: "Europe" },
    { name: "Vietnam",     shortName: "VIE", country: "Vietnam",     stadiumName: "Mỹ Đình",                 founded: 1962, primaryColor: "#DA251D",  secondaryColor: "#FFCD00",  type: "national", region: "Asia" },
    { name: "Japan",       shortName: "JPN", country: "Japan",       stadiumName: "Japan National Stadium",  founded: 1921, primaryColor: "#000080",  secondaryColor: "#FFFFFF",  type: "national", region: "Asia" },
    { name: "South Korea", shortName: "KOR", country: "South Korea", stadiumName: "Seoul World Cup Stadium", founded: 1928, primaryColor: "#003DA5",  secondaryColor: "#FF0000",  type: "national", region: "Asia" },
  ],
};

const KNOWN_PLAYERS: Record<string, string[]> = {
  "Arsenal FC":             ["David Raya","Ben White","Gabriel Magalhães","Oleksandr Zinchenko","Jurriën Timber","Thomas Partey","Martin Ødegaard","Declan Rice","Leandro Trossard","Bukayo Saka","Kai Havertz"],
  "Chelsea FC":             ["Robert Sánchez","Reece James","Levi Colwill","Ben Chilwell","Wesley Fofana","Moisés Caicedo","Enzo Fernández","Cole Palmer","Pedro Neto","Noni Madueke","Nicolas Jackson"],
  "Manchester City":        ["Ederson","Kyle Walker","Rúben Dias","Manuel Akanji","Josko Gvardiol","Rodri","Kevin De Bruyne","Bernardo Silva","Jack Grealish","Phil Foden","Erling Haaland"],
  "Manchester United":      ["André Onana","Diogo Dalot","Raphaël Varane","Lisandro Martínez","Luke Shaw","Casemiro","Bruno Fernandes","Mason Mount","Marcus Rashford","Antony","Rasmus Højlund"],
  "Liverpool FC":           ["Alisson Becker","Trent Alexander-Arnold","Virgil van Dijk","Ibrahima Konaté","Andrew Robertson","Alexis Mac Allister","Dominik Szoboszlai","Curtis Jones","Luis Díaz","Mohamed Salah","Darwin Núñez"],
  "Tottenham Hotspur":      ["Guglielmo Vicario","Pedro Porro","Micky van de Ven","Cristian Romero","Destiny Udogie","Pierre-Emile Højbjerg","Yves Bissouma","James Maddison","Dejan Kulusevski","Brennan Johnson","Son Heung-min"],
  "Aston Villa":            ["Emiliano Martínez","Matty Cash","Pau Torres","Ezri Konsa","Alex Moreno","Douglas Luiz","John McGinn","Emiliano Buendía","Leon Bailey","Moussa Diaby","Ollie Watkins"],
  "Newcastle United":       ["Nick Pope","Kieran Trippier","Sven Botman","Fabian Schär","Dan Burn","Bruno Guimarães","Joelinton","Sean Longstaff","Harvey Barnes","Anthony Gordon","Alexander Isak"],
  "Real Madrid CF":         ["Thibaut Courtois","Dani Carvajal","David Alaba","Antonio Rüdiger","Ferland Mendy","Eduardo Camavinga","Toni Kroos","Jude Bellingham","Vinicius Jr","Rodrygo","Kylian Mbappé"],
  "FC Barcelona":           ["Marc-André ter Stegen","Jules Koundé","Ronald Araújo","Pau Cubarsí","Alejandro Balde","Frenkie de Jong","Pedri","Gavi","Raphinha","Lamine Yamal","Robert Lewandowski"],
  "Atletico de Madrid":     ["Jan Oblak","Marcos Llorente","José María Giménez","Mario Hermoso","Reinildo","Koke","Rodrigo De Paul","Thomas Lemar","Saúl Ñíguez","Samuel Lino","Antoine Griezmann"],
  "Sevilla FC":             ["Ørjan Nyland","Gonzalo Montiel","Loïc Badé","Marcos Acuña","Alejandro Pozo","Óliver Torres","Fernando","Bryan Gil","Jesús Navas","Youssef En-Nesyri","Rafa Mir"],
  "Real Sociedad":          ["Álex Remiro","Hamari Traoré","Aritz Elustondo","Nayef Aguerd","Aihen Muñoz","Takefusa Kubo","Martín Zubimendi","Mikel Merino","Ander Barrenetxea","Brais Méndez","Alexander Sørloth"],
  "Villarreal CF":          ["Filip Jörgensen","Alfonso Pedraza","Raúl Albiol","Pervis Estupiñán","Yeremy Pino","Alex Baena","Manu Trigueros","Samuel Chukwueze","Étienne Capoue","Paco Alcácer","Gerard Moreno"],
  "FC Bayern München":      ["Manuel Neuer","Noussair Mazraoui","Min-jae Kim","Matthijs de Ligt","Alphonso Davies","Leon Goretzka","Joshua Kimmich","Jamal Musiala","Kingsley Coman","Thomas Müller","Harry Kane"],
  "Borussia Dortmund":      ["Gregor Kobel","Julian Ryerson","Niklas Süle","Nico Schlotterbeck","Ian Maatsen","Marcel Sabitzer","Emre Can","Felix Nmecha","Karim Adeyemi","Jamie Bynoe-Gittens","Sébastien Haller"],
  "RB Leipzig":             ["Peter Gulácsi","Benjamin Henrichs","Willi Orbán","Lukas Klostermann","David Raum","Xaver Schlager","Kevin Kampl","Dani Olmo","Timo Werner","Lois Openda","André Silva"],
  "Bayer 04 Leverkusen":    ["Lukáš Hrádecký","Jeremie Frimpong","Odilon Kossounou","Jonathan Tah","Alejandro Grimaldo","Robert Andrich","Granit Xhaka","Florian Wirtz","Jonas Hofmann","Amine Adli","Victor Boniface"],
  "Eintracht Frankfurt":    ["Kevin Trapp","Rasmus Kristensen","Tuta","Robin Koch","Philipp Max","Ellyes Skhiri","Mario Götze","Ansgar Knauff","Junior Dina Ebimbe","Hugo Ekitiké","Randal Kolo Muani"],
  "Juventus FC":            ["Wojciech Szczęsny","Andrea Cambiaso","Gleison Bremer","Federico Gatti","Alex Sandro","Nicolò Fagioli","Adrien Rabiot","Weston McKennie","Federico Chiesa","Filip Kostić","Dušan Vlahović"],
  "AC Milan":               ["Mike Maignan","Davide Calabria","Fikayo Tomori","Malick Thiaw","Theo Hernández","Ruben Loftus-Cheek","Tijjani Reijnders","Yunus Musah","Christian Pulisic","Rafael Leão","Olivier Giroud"],
  "Inter Milan":            ["Yann Sommer","Denzel Dumfries","Francesco Acerbi","Alessandro Bastoni","Federico Dimarco","Nicolò Barella","Hakan Çalhanoğlu","Henrikh Mkhitaryan","Matteo Darmian","Marcus Thuram","Lautaro Martínez"],
  "AS Roma":                ["Rui Patrício","Rick Karsdorp","Gianluca Mancini","Chris Smalling","Angeliño","Leandro Paredes","Lorenzo Pellegrini","Paulo Dybala","Stephan El Shaarawy","Tammy Abraham","Romelu Lukaku"],
  "SSC Napoli":             ["Alex Meret","Giovanni Di Lorenzo","Min-jae Kim","Amir Rrahmani","Mathías Olivera","Piotr Zielinski","Stanislav Lobotka","Eljif Elmas","Khvicha Kvaratskhelia","Hirving Lozano","Victor Osimhen"],
  "Paris Saint-Germain":    ["Gianluigi Donnarumma","Achraf Hakimi","Marquinhos","Lucas Hernández","Nuno Mendes","Vitinha","Manuel Ugarte","Warren Zaïre-Emery","Bradley Barcola","Ousmane Dembélé","Randal Kolo Muani"],
  "Olympique de Marseille": ["Pau López","Jonathan Clauss","Samuel Gigot","Leonardo Balerdi","Nuno Tavares","Valentin Rongier","Jordan Veretout","Mattéo Guendouzi","Amine Harit","Alexis Sánchez","Pierre-Emerick Aubameyang"],
  "Olympique Lyonnais":     ["Lucas Perri","Malo Gusto","Castello Lukeba","Nicolas Tagliafico","Maxence Caqueret","Johann Lepenant","Corentin Tolisso","Romain Faivre","Tetê","Ernest Nuamah","Alexandre Lacazette"],
  "AS Monaco":              ["Philipp Köhn","Vanderson","Axel Disasi","Benoît Badiashile","Caio Henrique","Youssouf Fofana","Jean Lucas","Maghnes Akliouche","Krépin Diatta","Takumi Minamino","Wissam Ben Yedder"],
  "Hà Nội FC":              ["Tấn Trường","Thành Chung","Đình Trọng","Văn Kiên","Hùng Dũng","Văn Quyết","Quang Hải","Thái Sơn","Đức Chinh","Tiến Linh","Văn Toàn"],
  "Hoàng Anh Gia Lai":      ["Văn Lâm","Văn Thanh","Hồng Duy","Tấn Sinh","Đức Lương","Thanh Bình","Xuân Trường","Công Phượng","Minh Vương","Văn Tùng","Đình Bảo"],
  "SHB Đà Nẵng":            ["Tuấn Mạnh","Xuân Mạnh","Hải Thuỳ","Minh Hiếu","Quý Hạnh","Quang Phúc","Thanh Hiền","Thành Luân","Ngọc Sơn","Trọng Hùng","Việt Cường"],
  "Viettel FC":             ["Phí Minh Long","Việt Anh","Bùi Hoàng Việt Anh","Ngô Tùng Quốc","Trần Đình Trọng","Hoàng Đức","Nguyễn Hai Long","Nguyễn Trọng Hoàng","Từ Hiển Đạt","Nguyễn Tiến Linh","Bùi Vĩ Hào"],
  "TP.HCM FC":              ["Tâm Dũng","Tấn Đức","Đức Lương","Vĩnh Long","Duy Quang","Hữu Thắng","Văn Toàn","Anh Đức","Quang Hải","Tiến Dụng","Minh Trí"],
  "Bình Dương FC":          ["Dương Hồng Sơn","Hữu Quang","Đức Hiếu","Kim Thành","Phi Long","Hải Long","Minh Hiếu","Văn Khang","Nhật Nam","Tiến Anh","Lâm Anh Quân"],
  "Al Hilal SFC":           ["Yassine Bounou","Saud Abdulhamid","Kalidou Koulibaly","Ali Al-Bulaihi","João Cancelo","Ruben Neves","Sergej Milinković-Savić","Sandro Tonali","Michael Estrada","Aleksandar Mitrović","Neymar Jr"],
  "Al Nassr FC":            ["Bento","Salmeen Al-Motairi","Aymeric Laporte","Marcelo Brozović","Ali Lajami","Sami Al-Najei","Luiz Gustavo","Sadio Mané","Abdulrahman Ghareeb","Anderson Talisca","Cristiano Ronaldo"],
  "Al Ittihad Club":        ["Marcelo Grohe","Siyabonga Ngezana","Jota","Fabinho","N'Golo Kanté","Romarinho","Karim Benzema","Riyad Mahrez","Roberto Firmino","Luiz Felipe","Naif Aguerd"],
  "Al Ahli Saudi FC":       ["Edouard Mendy","Saud Abdulhamid","Roger Ibañez","Merih Demiral","Bruno","Gabri Veiga","Franck Kessié","Allan Saint-Maximin","Ivan Toney","Ryan Babel","Roberto Firmino"],
};

const POSITIONS = ["GK","CB","CB","LB","RB","CDM","CM","CAM","LW","RW","ST"] as const;
function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makePlayers(teamId: number, teamName: string): Omit<typeof playersTable.$inferInsert, "id">[] {
  const names = KNOWN_PLAYERS[teamName] ?? POSITIONS.map((_, i) => `Player ${i + 1}`);
  return POSITIONS.map((pos, i) => {
    const isAttacker = ["ST","CAM","LW","RW"].includes(pos);
    const isDefender = ["GK","CB","LB","RB"].includes(pos);
    return {
      name: names[i] ?? `Player ${i + 1}`,
      displayName: (names[i] ?? `Player ${i + 1}`).split(" ").pop()!,
      nationality: "International",
      position: pos, number: i + 1, age: rnd(19, 36), teamId,
      rating:    isAttacker ? rnd(72, 95) : isDefender ? rnd(70, 92) : rnd(70, 93),
      pace:      isAttacker ? rnd(72, 97) : isDefender ? rnd(55, 82) : rnd(60, 85),
      shooting:  isAttacker ? rnd(75, 96) : pos === "GK" ? rnd(20, 35) : rnd(45, 72),
      passing:   rnd(65, 92),
      dribbling: isAttacker ? rnd(72, 96) : pos === "GK" ? rnd(25, 45) : rnd(55, 80),
      defending: isDefender ? rnd(72, 93) : pos === "GK" ? rnd(10, 20) : rnd(40, 72),
      physical:  rnd(65, 90),
      goals:     isAttacker ? rnd(0, 22) : pos === "CAM" ? rnd(0, 12) : rnd(0, 4),
      assists:   ["CAM","CM","LW","RW"].includes(pos) ? rnd(0, 16) : rnd(0, 6),
      matchesPlayed: rnd(5, 32),
    };
  });
}

async function seed() {
  console.log("🌱 Starting seed…");
  await db.delete(standingsTable);
  await db.delete(matchesTable);
  await db.delete(playersTable);
  await db.delete(teamsTable);
  await db.delete(leaguesTable);
  console.log("🗑️  Cleared existing data");

  const insertedLeagues = await db.insert(leaguesTable).values(LEAGUES).returning();
  const leagueByName = new Map(insertedLeagues.map(l => [l.name, l]));
  console.log(`✅ ${insertedLeagues.length} leagues`);

  const teamInserts: Omit<typeof teamsTable.$inferInsert, "id">[] = [];
  for (const [leagueName, teams] of Object.entries(TEAMS_BY_LEAGUE)) {
    const league = leagueByName.get(leagueName);
    if (!league) continue;
    for (const t of teams) teamInserts.push({
      name: t.name, shortName: t.shortName, country: t.country,
      region: t.region ?? league.region, type: t.type ?? "club",
      stadiumName: t.stadiumName, founded: t.founded,
      primaryColor: t.primaryColor, secondaryColor: t.secondaryColor,
      leagueId: league.id,
    });
  }
  const insertedTeams = await db.insert(teamsTable).values(teamInserts).returning();
  console.log(`✅ ${insertedTeams.length} teams`);

  const clubTeams = insertedTeams.filter(t => t.type === "club");
  const playerRows: Omit<typeof playersTable.$inferInsert, "id">[] = [];
  for (const team of clubTeams) playerRows.push(...makePlayers(team.id, team.name));
  for (let i = 0; i < playerRows.length; i += 100)
    await db.insert(playersTable).values(playerRows.slice(i, i + 100));
  console.log(`✅ ${playerRows.length} players`);

  const today = new Date();
  const matchRows: Omit<typeof matchesTable.$inferInsert, "id">[] = [];
  const teamsByLeague = new Map<number, typeof insertedTeams>();
  for (const team of clubTeams) {
    if (!team.leagueId) continue;
    if (!teamsByLeague.has(team.leagueId)) teamsByLeague.set(team.leagueId, []);
    teamsByLeague.get(team.leagueId)!.push(team);
  }
  for (const [leagueId, teams] of teamsByLeague) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const daysOffset = rnd(-180, 90);
        const matchDate = new Date(today);
        matchDate.setDate(matchDate.getDate() + daysOffset);
        let status: "finished"|"live"|"upcoming" = "upcoming";
        let homeScore: number|null = null, awayScore: number|null = null, minute: number|null = null;
        if (daysOffset < -1) { status = "finished"; homeScore = rnd(0,5); awayScore = rnd(0,4); }
        else if (daysOffset === 0 && Math.random() > 0.5) { status = "live"; homeScore = rnd(0,3); awayScore = rnd(0,2); minute = rnd(1,90); }
        matchRows.push({ homeTeamId: teams[i].id, awayTeamId: teams[j].id, leagueId, status, scheduledAt: matchDate, homeScore, awayScore, minute, venue: teams[i].stadiumName ?? undefined });
      }
    }
  }
  for (let i = 0; i < matchRows.length; i += 100)
    await db.insert(matchesTable).values(matchRows.slice(i, i + 100));
  console.log(`✅ ${matchRows.length} matches`);

  type SS = { played:number; won:number; drawn:number; lost:number; gf:number; ga:number; pts:number; form:string[] };
  const stats = new Map<string, SS>();
  const k = (lid:number, tid:number) => `${lid}:${tid}`;
  for (const [leagueId, teams] of teamsByLeague)
    for (const t of teams) stats.set(k(leagueId,t.id), {played:0,won:0,drawn:0,lost:0,gf:0,ga:0,pts:0,form:[]});
  for (const m of matchRows) {
    if (m.status !== "finished" || m.homeScore==null || m.awayScore==null) continue;
    const hs = stats.get(k(m.leagueId, m.homeTeamId))!;
    const as_ = stats.get(k(m.leagueId, m.awayTeamId))!;
    if (!hs||!as_) continue;
    hs.played++; hs.gf+=m.homeScore; hs.ga+=m.awayScore;
    as_.played++; as_.gf+=m.awayScore; as_.ga+=m.homeScore;
    if (m.homeScore>m.awayScore) { hs.won++;hs.pts+=3;hs.form.push("W");as_.lost++;as_.form.push("L"); }
    else if (m.homeScore<m.awayScore) { as_.won++;as_.pts+=3;as_.form.push("W");hs.lost++;hs.form.push("L"); }
    else { hs.drawn++;hs.pts++;hs.form.push("D");as_.drawn++;as_.pts++;as_.form.push("D"); }
  }
  const standingRows: Omit<typeof standingsTable.$inferInsert,"id">[] = [];
  for (const [leagueId, teams] of teamsByLeague) {
    const sorted = [...teams].sort((a,b)=>(stats.get(k(leagueId,b.id))?.pts??0)-(stats.get(k(leagueId,a.id))?.pts??0));
    sorted.forEach((team,idx) => {
      const s = stats.get(k(leagueId,team.id))!;
      standingRows.push({ leagueId, teamId:team.id, position:idx+1, played:s.played, won:s.won, drawn:s.drawn, lost:s.lost, goalsFor:s.gf, goalsAgainst:s.ga, points:s.pts, form:s.form.slice(-5).join("") });
    });
  }
  for (let i = 0; i < standingRows.length; i += 100)
    await db.insert(standingsTable).values(standingRows.slice(i, i + 100));
  console.log(`✅ ${standingRows.length} standings`);

  console.log("🎉 Seed complete!");
  await pool.end();
}

seed().catch(err => { console.error("❌ Seed failed:", err); pool.end(); process.exit(1); });
