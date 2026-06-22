import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });
const { leaguesTable, teamsTable, playersTable, matchesTable, standingsTable } = schema;

// ── LEAGUES ──────────────────────────────────────────────────────────────────
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
] as const;

// ── TEAM HELPER TYPE ──────────────────────────────────────────────────────────
type TeamDef = { name: string; shortName: string; country: string; stadiumName: string; founded: number; primaryColor: string; secondaryColor: string; type?: string; region?: string };
type LeagueName = typeof LEAGUES[number]["name"];

// ── TEAMS BY LEAGUE ──────────────────────────────────────────────────────────
const TEAMS: Record<LeagueName, TeamDef[]> = {

  // ═══════════ PREMIER LEAGUE (20 teams) ═══════════
  "Premier League": [
    { name:"Arsenal FC",             shortName:"ARS",  country:"England", stadiumName:"Emirates Stadium",          founded:1886, primaryColor:"#EF0107", secondaryColor:"#FFFFFF" },
    { name:"Chelsea FC",             shortName:"CHE",  country:"England", stadiumName:"Stamford Bridge",           founded:1905, primaryColor:"#034694", secondaryColor:"#FFFFFF" },
    { name:"Manchester City",        shortName:"MCI",  country:"England", stadiumName:"Etihad Stadium",            founded:1880, primaryColor:"#6CABDD", secondaryColor:"#1C2C5B" },
    { name:"Manchester United",      shortName:"MUN",  country:"England", stadiumName:"Old Trafford",              founded:1878, primaryColor:"#DA291C", secondaryColor:"#FBE122" },
    { name:"Liverpool FC",           shortName:"LIV",  country:"England", stadiumName:"Anfield",                   founded:1892, primaryColor:"#C8102E", secondaryColor:"#F6EB61" },
    { name:"Tottenham Hotspur",      shortName:"TOT",  country:"England", stadiumName:"Tottenham Hotspur Stadium", founded:1882, primaryColor:"#132257", secondaryColor:"#FFFFFF" },
    { name:"Aston Villa",            shortName:"AVL",  country:"England", stadiumName:"Villa Park",                founded:1874, primaryColor:"#95BFE5", secondaryColor:"#670E36" },
    { name:"Newcastle United",       shortName:"NEW",  country:"England", stadiumName:"St. James' Park",           founded:1892, primaryColor:"#241F20", secondaryColor:"#FFFFFF" },
    { name:"Brighton & Hove Albion", shortName:"BHA",  country:"England", stadiumName:"Amex Stadium",             founded:1901, primaryColor:"#0057B8", secondaryColor:"#FFFFFF" },
    { name:"West Ham United",        shortName:"WHU",  country:"England", stadiumName:"London Stadium",           founded:1895, primaryColor:"#7A263A", secondaryColor:"#1BB1E7" },
    { name:"Crystal Palace",         shortName:"CRY",  country:"England", stadiumName:"Selhurst Park",            founded:1905, primaryColor:"#1B458F", secondaryColor:"#C4122E" },
    { name:"Wolverhampton Wanderers",shortName:"WOL",  country:"England", stadiumName:"Molineux Stadium",         founded:1877, primaryColor:"#FDB913", secondaryColor:"#231F20" },
    { name:"Fulham FC",              shortName:"FUL",  country:"England", stadiumName:"Craven Cottage",           founded:1879, primaryColor:"#FFFFFF", secondaryColor:"#000000" },
    { name:"Brentford FC",           shortName:"BRE",  country:"England", stadiumName:"Gtech Community Stadium",  founded:1889, primaryColor:"#E30613", secondaryColor:"#FFFFFF" },
    { name:"Nottingham Forest",      shortName:"NFO",  country:"England", stadiumName:"City Ground",              founded:1865, primaryColor:"#E53233", secondaryColor:"#FFFFFF" },
    { name:"Everton FC",             shortName:"EVE",  country:"England", stadiumName:"Goodison Park",            founded:1878, primaryColor:"#003399", secondaryColor:"#FFFFFF" },
    { name:"AFC Bournemouth",        shortName:"BOU",  country:"England", stadiumName:"Vitality Stadium",         founded:1899, primaryColor:"#DA291C", secondaryColor:"#000000" },
    { name:"Luton Town",             shortName:"LUT",  country:"England", stadiumName:"Kenilworth Road",          founded:1885, primaryColor:"#F78F1E", secondaryColor:"#003082" },
    { name:"Sheffield United",       shortName:"SHU",  country:"England", stadiumName:"Bramall Lane",             founded:1889, primaryColor:"#EE2737", secondaryColor:"#000000" },
    { name:"Burnley FC",             shortName:"BUR",  country:"England", stadiumName:"Turf Moor",                founded:1882, primaryColor:"#6C1D45", secondaryColor:"#99D6EA" },
  ],

  // ═══════════ LA LIGA (20 teams) ═══════════
  "La Liga": [
    { name:"Real Madrid CF",         shortName:"RMA",  country:"Spain", stadiumName:"Santiago Bernabéu",        founded:1902, primaryColor:"#FEBE10", secondaryColor:"#FFFFFF" },
    { name:"FC Barcelona",           shortName:"BAR",  country:"Spain", stadiumName:"Spotify Camp Nou",         founded:1899, primaryColor:"#A50044", secondaryColor:"#004D98" },
    { name:"Atletico de Madrid",     shortName:"ATL",  country:"Spain", stadiumName:"Civitas Metropolitano",    founded:1903, primaryColor:"#CB3524", secondaryColor:"#272E61" },
    { name:"Sevilla FC",             shortName:"SEV",  country:"Spain", stadiumName:"Ramón Sánchez-Pizjuán",    founded:1890, primaryColor:"#D2122E", secondaryColor:"#FFFFFF" },
    { name:"Real Sociedad",          shortName:"RSO",  country:"Spain", stadiumName:"Reale Arena",              founded:1909, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Villarreal CF",          shortName:"VIL",  country:"Spain", stadiumName:"Estadio de la Cerámica",   founded:1923, primaryColor:"#FFE135", secondaryColor:"#004F9F" },
    { name:"Athletic Club",          shortName:"ATH",  country:"Spain", stadiumName:"San Mamés",                founded:1898, primaryColor:"#EE2523", secondaryColor:"#FFFFFF" },
    { name:"Real Betis",             shortName:"BET",  country:"Spain", stadiumName:"Benito Villamarín",        founded:1907, primaryColor:"#00954C", secondaryColor:"#FFFFFF" },
    { name:"Celta Vigo",             shortName:"CEL",  country:"Spain", stadiumName:"Abanca-Balaídos",          founded:1923, primaryColor:"#75AADB", secondaryColor:"#FFFFFF" },
    { name:"Osasuna",                shortName:"OSA",  country:"Spain", stadiumName:"El Sadar",                 founded:1920, primaryColor:"#D62229", secondaryColor:"#003F8C" },
    { name:"Rayo Vallecano",         shortName:"RAY",  country:"Spain", stadiumName:"Estadio de Vallecas",      founded:1924, primaryColor:"#C8102E", secondaryColor:"#FFFFFF" },
    { name:"Getafe CF",              shortName:"GET",  country:"Spain", stadiumName:"Coliseum Alfonso Pérez",   founded:1983, primaryColor:"#005CA9", secondaryColor:"#FFFFFF" },
    { name:"Girona FC",              shortName:"GIR",  country:"Spain", stadiumName:"Montilivi",                founded:1930, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"UD Almería",             shortName:"ALM",  country:"Spain", stadiumName:"Power Horse Stadium",      founded:1989, primaryColor:"#ED3024", secondaryColor:"#FFFFFF" },
    { name:"RCD Mallorca",           shortName:"MAL",  country:"Spain", stadiumName:"Visit Mallorca Estadi",    founded:1916, primaryColor:"#C8102E", secondaryColor:"#FFC72C" },
    { name:"Granada CF",             shortName:"GRA",  country:"Spain", stadiumName:"Estadio Nuevo Los Cármenes",founded:1931, primaryColor:"#C41230", secondaryColor:"#FFFFFF" },
    { name:"UD Las Palmas",          shortName:"LPA",  country:"Spain", stadiumName:"Estadio Gran Canaria",     founded:1949, primaryColor:"#FFCB00", secondaryColor:"#003DA5" },
    { name:"Deportivo Alavés",       shortName:"ALA",  country:"Spain", stadiumName:"Mendizorroza",             founded:1921, primaryColor:"#007AC2", secondaryColor:"#FFFFFF" },
    { name:"Cádiz CF",               shortName:"CAD",  country:"Spain", stadiumName:"Nuevo Mirandilla",         founded:1910, primaryColor:"#F5D00B", secondaryColor:"#003DA5" },
    { name:"Valencia CF",            shortName:"VAL",  country:"Spain", stadiumName:"Mestalla",                 founded:1919, primaryColor:"#FF7900", secondaryColor:"#FFFFFF" },
  ],

  // ═══════════ BUNDESLIGA (18 teams) ═══════════
  "Bundesliga": [
    { name:"FC Bayern München",      shortName:"FCB",  country:"Germany", stadiumName:"Allianz Arena",           founded:1900, primaryColor:"#DC052D", secondaryColor:"#0066B2" },
    { name:"Borussia Dortmund",      shortName:"BVB",  country:"Germany", stadiumName:"Signal Iduna Park",       founded:1909, primaryColor:"#FDE100", secondaryColor:"#000000" },
    { name:"RB Leipzig",             shortName:"RBL",  country:"Germany", stadiumName:"Red Bull Arena",          founded:2009, primaryColor:"#DD0741", secondaryColor:"#0B1560" },
    { name:"Bayer 04 Leverkusen",    shortName:"B04",  country:"Germany", stadiumName:"BayArena",                founded:1904, primaryColor:"#E32221", secondaryColor:"#000000" },
    { name:"Eintracht Frankfurt",    shortName:"SGE",  country:"Germany", stadiumName:"Deutsche Bank Park",      founded:1899, primaryColor:"#E1000F", secondaryColor:"#000000" },
    { name:"VfB Stuttgart",          shortName:"STR",  country:"Germany", stadiumName:"MHPArena",                founded:1893, primaryColor:"#E32219", secondaryColor:"#FFFFFF" },
    { name:"SV Werder Bremen",       shortName:"BRE",  country:"Germany", stadiumName:"Weserstadion",            founded:1899, primaryColor:"#1D9053", secondaryColor:"#FFFFFF" },
    { name:"SC Freiburg",            shortName:"SCF",  country:"Germany", stadiumName:"Europa-Park Stadion",     founded:1904, primaryColor:"#E1000F", secondaryColor:"#000000" },
    { name:"TSG Hoffenheim",         shortName:"TSG",  country:"Germany", stadiumName:"PreZero Arena",           founded:1899, primaryColor:"#1961A2", secondaryColor:"#FFFFFF" },
    { name:"Borussia M'gladbach",    shortName:"BMG",  country:"Germany", stadiumName:"Borussia-Park",           founded:1900, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"FC Augsburg",            shortName:"FCA",  country:"Germany", stadiumName:"WWK Arena",               founded:1907, primaryColor:"#BA3733", secondaryColor:"#007B5F" },
    { name:"VfL Wolfsburg",          shortName:"WOB",  country:"Germany", stadiumName:"Volkswagen Arena",        founded:1945, primaryColor:"#65B32E", secondaryColor:"#003D80" },
    { name:"1. FC Köln",             shortName:"KOE",  country:"Germany", stadiumName:"RheinEnergieStadion",     founded:1948, primaryColor:"#E8002D", secondaryColor:"#FFFFFF" },
    { name:"1. FSV Mainz 05",        shortName:"M05",  country:"Germany", stadiumName:"Mewa Arena",              founded:1905, primaryColor:"#C3142A", secondaryColor:"#FFFFFF" },
    { name:"Union Berlin",           shortName:"FCU",  country:"Germany", stadiumName:"An der Alten Försterei",  founded:1906, primaryColor:"#EB0027", secondaryColor:"#FFFFFF" },
    { name:"VfL Bochum",             shortName:"BOC",  country:"Germany", stadiumName:"Vonovia Ruhrstadion",     founded:1848, primaryColor:"#005CA9", secondaryColor:"#FFFFFF" },
    { name:"1. FC Heidenheim",       shortName:"FCH",  country:"Germany", stadiumName:"Voith-Arena",             founded:1846, primaryColor:"#C1001A", secondaryColor:"#FFFFFF" },
    { name:"SV Darmstadt 98",        shortName:"SVD",  country:"Germany", stadiumName:"Merck-Stadion",           founded:1898, primaryColor:"#005CA9", secondaryColor:"#FFFFFF" },
  ],

  // ═══════════ SERIE A (20 teams) ═══════════
  "Serie A": [
    { name:"Juventus FC",            shortName:"JUV",  country:"Italy", stadiumName:"Allianz Stadium",           founded:1897, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"AC Milan",               shortName:"MIL",  country:"Italy", stadiumName:"San Siro",                  founded:1899, primaryColor:"#FB090B", secondaryColor:"#000000" },
    { name:"Inter Milan",            shortName:"INT",  country:"Italy", stadiumName:"San Siro",                  founded:1908, primaryColor:"#010E80", secondaryColor:"#000000" },
    { name:"AS Roma",                shortName:"ROM",  country:"Italy", stadiumName:"Stadio Olimpico",           founded:1927, primaryColor:"#8E1F2F", secondaryColor:"#F5AA1C" },
    { name:"SSC Napoli",             shortName:"NAP",  country:"Italy", stadiumName:"Diego Armando Maradona",    founded:1926, primaryColor:"#12A0C7", secondaryColor:"#FFFFFF" },
    { name:"Atalanta BC",            shortName:"ATA",  country:"Italy", stadiumName:"Gewiss Stadium",            founded:1907, primaryColor:"#1E3870", secondaryColor:"#000000" },
    { name:"ACF Fiorentina",         shortName:"FIO",  country:"Italy", stadiumName:"Artemio Franchi",           founded:1926, primaryColor:"#4B0082", secondaryColor:"#FFFFFF" },
    { name:"SS Lazio",               shortName:"LAZ",  country:"Italy", stadiumName:"Stadio Olimpico",           founded:1900, primaryColor:"#87CEEB", secondaryColor:"#FFFFFF" },
    { name:"Torino FC",              shortName:"TOR",  country:"Italy", stadiumName:"Stadio Olimpico Grande Torino",founded:1906, primaryColor:"#8B2500", secondaryColor:"#FFFFFF" },
    { name:"Bologna FC",             shortName:"BOL",  country:"Italy", stadiumName:"Renato Dall'Ara",           founded:1909, primaryColor:"#003DA5", secondaryColor:"#CC0000" },
    { name:"Genoa CFC",              shortName:"GEN",  country:"Italy", stadiumName:"Luigi Ferraris",            founded:1893, primaryColor:"#CC0000", secondaryColor:"#003DA5" },
    { name:"Monza",                  shortName:"MON2", country:"Italy", stadiumName:"U-Power Stadium",           founded:1912, primaryColor:"#FF0000", secondaryColor:"#FFFFFF" },
    { name:"Udinese Calcio",         shortName:"UDI",  country:"Italy", stadiumName:"Bluenergy Stadium",         founded:1896, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"Hellas Verona",          shortName:"HEL",  country:"Italy", stadiumName:"Marcantonio Bentegodi",     founded:1903, primaryColor:"#003DA5", secondaryColor:"#FFD700" },
    { name:"US Lecce",               shortName:"LEC",  country:"Italy", stadiumName:"Via del Mare",              founded:1908, primaryColor:"#F5D030", secondaryColor:"#CC0000" },
    { name:"Cagliari Calcio",        shortName:"CAG",  country:"Italy", stadiumName:"Unipol Domus",              founded:1920, primaryColor:"#C8102E", secondaryColor:"#003DA5" },
    { name:"Frosinone Calcio",       shortName:"FRO",  country:"Italy", stadiumName:"Stadio Benito Stirpe",      founded:1928, primaryColor:"#FEC400", secondaryColor:"#003DA5" },
    { name:"Empoli FC",              shortName:"EMP",  country:"Italy", stadiumName:"Stadio Carlo Castellani",   founded:1920, primaryColor:"#007FBA", secondaryColor:"#FFFFFF" },
    { name:"US Salernitana",         shortName:"SAL",  country:"Italy", stadiumName:"Stadio Arechi",             founded:1919, primaryColor:"#800000", secondaryColor:"#FFFFFF" },
    { name:"US Sassuolo",            shortName:"SAS",  country:"Italy", stadiumName:"Mapei Stadium",             founded:1920, primaryColor:"#00B140", secondaryColor:"#000000" },
  ],

  // ═══════════ LIGUE 1 (18 teams) ═══════════
  "Ligue 1": [
    { name:"Paris Saint-Germain",    shortName:"PSG",  country:"France", stadiumName:"Parc des Princes",         founded:1970, primaryColor:"#003F8A", secondaryColor:"#DA291C" },
    { name:"Olympique de Marseille", shortName:"OM",   country:"France", stadiumName:"Stade Vélodrome",          founded:1899, primaryColor:"#2CBFEF", secondaryColor:"#FFFFFF" },
    { name:"Olympique Lyonnais",     shortName:"OL",   country:"France", stadiumName:"Parc OL",                  founded:1950, primaryColor:"#0E3F8A", secondaryColor:"#DA291C" },
    { name:"AS Monaco",              shortName:"MON",  country:"Monaco", stadiumName:"Stade Louis II",           founded:1919, primaryColor:"#ED1C24", secondaryColor:"#FFFFFF" },
    { name:"RC Lens",                shortName:"LEN",  country:"France", stadiumName:"Stade Bollaert-Delelis",   founded:1906, primaryColor:"#E30613", secondaryColor:"#FFD700" },
    { name:"Lille OSC",              shortName:"LIL",  country:"France", stadiumName:"Stade Pierre-Mauroy",      founded:1944, primaryColor:"#DA2034", secondaryColor:"#FFFFFF" },
    { name:"Stade Rennais",          shortName:"REN",  country:"France", stadiumName:"Roazhon Park",             founded:1901, primaryColor:"#E30613", secondaryColor:"#000000" },
    { name:"Stade Brestois 29",      shortName:"BRE2", country:"France", stadiumName:"Stade Francis-Le Blé",     founded:1950, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"OGC Nice",               shortName:"NIC",  country:"France", stadiumName:"Allianz Riviera",          founded:1904, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"Toulouse FC",            shortName:"TOU",  country:"France", stadiumName:"Stadium de Toulouse",      founded:1937, primaryColor:"#4B0082", secondaryColor:"#FFFFFF" },
    { name:"FC Nantes",              shortName:"NAN",  country:"France", stadiumName:"Stade de la Beaujoire",    founded:1943, primaryColor:"#F5A000", secondaryColor:"#000000" },
    { name:"RC Strasbourg",          shortName:"STR2", country:"France", stadiumName:"Stade de la Meinau",       founded:1906, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Stade de Reims",         shortName:"REI",  country:"France", stadiumName:"Stade Auguste-Delaune",    founded:1931, primaryColor:"#C41230", secondaryColor:"#FFFFFF" },
    { name:"Montpellier HSC",        shortName:"MTP",  country:"France", stadiumName:"Stade de la Mosson",       founded:1974, primaryColor:"#003DA5", secondaryColor:"#F5A000" },
    { name:"Le Havre AC",            shortName:"HAV",  country:"France", stadiumName:"Stade Océane",             founded:1872, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"FC Metz",                shortName:"MET",  country:"France", stadiumName:"Stade Saint-Symphorien",   founded:1932, primaryColor:"#7B0D38", secondaryColor:"#FFFFFF" },
    { name:"Clermont Foot",          shortName:"CLF",  country:"France", stadiumName:"Stade Gabriel Montpied",   founded:1911, primaryColor:"#FF0000", secondaryColor:"#003DA5" },
    { name:"FC Lorient",             shortName:"LOR",  country:"France", stadiumName:"Stade du Moustoir",        founded:1926, primaryColor:"#F36F21", secondaryColor:"#000000" },
  ],

  // ═══════════ UCL (16 representative clubs) ═══════════
  "UEFA Champions League": [
    { name:"FK Red Star Belgrade",   shortName:"CZV",  country:"Serbia",  stadiumName:"Rajko Mitić",              founded:1945, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Benfica",                shortName:"SLB",  country:"Portugal",stadiumName:"Estádio da Luz",           founded:1904, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"FC Porto",               shortName:"FCP",  country:"Portugal",stadiumName:"Estádio do Dragão",        founded:1893, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Sporting CP",            shortName:"SPO",  country:"Portugal",stadiumName:"Estádio José Alvalade",    founded:1906, primaryColor:"#006600", secondaryColor:"#FFFFFF" },
    { name:"Club Brugge",            shortName:"BRU",  country:"Belgium", stadiumName:"Jan Breydel Stadion",      founded:1891, primaryColor:"#003DA5", secondaryColor:"#000000" },
    { name:"Galatasaray",            shortName:"GAL",  country:"Turkey",  stadiumName:"Rams Park",                founded:1905, primaryColor:"#CC0000", secondaryColor:"#FFD700" },
    { name:"Fenerbahçe",             shortName:"FEN",  country:"Turkey",  stadiumName:"Şükrü Saracoğlu",         founded:1907, primaryColor:"#002D5E", secondaryColor:"#FFD700" },
    { name:"Celtic FC",              shortName:"CEL2", country:"Scotland",stadiumName:"Celtic Park",              founded:1888, primaryColor:"#009033", secondaryColor:"#FFFFFF" },
    { name:"Rangers FC",             shortName:"RFC",  country:"Scotland",stadiumName:"Ibrox Stadium",            founded:1872, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Ajax",                   shortName:"AJX",  country:"Netherlands",stadiumName:"Johan Cruyff Arena",    founded:1900, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"PSV Eindhoven",          shortName:"PSV",  country:"Netherlands",stadiumName:"Philips Stadion",       founded:1913, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Feyenoord",              shortName:"FEY",  country:"Netherlands",stadiumName:"De Kuip",               founded:1908, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Dynamo Kyiv",            shortName:"DKY",  country:"Ukraine", stadiumName:"NSC Olimpiyskyi",          founded:1927, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Shakhtar Donetsk",       shortName:"SHA",  country:"Ukraine", stadiumName:"Donbass Arena",            founded:1936, primaryColor:"#FF6600", secondaryColor:"#000000" },
    { name:"Olympiacos",             shortName:"OLY",  country:"Greece",  stadiumName:"Georgios Karaiskakis",     founded:1925, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Panathinaikos",          shortName:"PAO",  country:"Greece",  stadiumName:"Apostolos Nikolaidis",     founded:1908, primaryColor:"#009300", secondaryColor:"#FFFFFF" },
  ],

  // ═══════════ V.LEAGUE 1 (14 teams) ═══════════
  "V.League 1": [
    { name:"Hà Nội FC",              shortName:"HAN",  country:"Vietnam", stadiumName:"Hàng Đẫy",                 founded:2007, primaryColor:"#FF0000", secondaryColor:"#FFFFFF" },
    { name:"Hoàng Anh Gia Lai",      shortName:"HAGL", country:"Vietnam", stadiumName:"Pleiku",                   founded:1999, primaryColor:"#FF6600", secondaryColor:"#FFFFFF" },
    { name:"SHB Đà Nẵng",            shortName:"DNT",  country:"Vietnam", stadiumName:"Chi Lăng",                 founded:1975, primaryColor:"#E30613", secondaryColor:"#000066" },
    { name:"Viettel FC",             shortName:"VTL",  country:"Vietnam", stadiumName:"Hàng Đẫy",                 founded:2009, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"TP.HCM FC",              shortName:"HCM",  country:"Vietnam", stadiumName:"Thống Nhất",               founded:2012, primaryColor:"#006633", secondaryColor:"#FFFFFF" },
    { name:"Becamex Bình Dương",     shortName:"BDN",  country:"Vietnam", stadiumName:"Gò Đậu",                   founded:1975, primaryColor:"#0000CC", secondaryColor:"#FFFFFF" },
    { name:"Nam Định FC",            shortName:"NDN",  country:"Vietnam", stadiumName:"Thiên Trường",             founded:1978, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Hải Phòng FC",           shortName:"HPH",  country:"Vietnam", stadiumName:"Lạch Tray",                founded:1957, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Topenland Bình Định",    shortName:"BDI",  country:"Vietnam", stadiumName:"Quy Nhơn",                 founded:2001, primaryColor:"#CC0000", secondaryColor:"#FFFF00" },
    { name:"Quảng Nam FC",           shortName:"QNM",  country:"Vietnam", stadiumName:"Tâm Đức",                  founded:2010, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Thanh Hóa FC",           shortName:"THA",  country:"Vietnam", stadiumName:"Thanh Hóa",               founded:1962, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Sông Lam Nghệ An",       shortName:"SLN",  country:"Vietnam", stadiumName:"Vinh",                    founded:1976, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Long An FC",             shortName:"LAN",  country:"Vietnam", stadiumName:"Long An",                  founded:1975, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Khánh Hòa FC",           shortName:"KHF",  country:"Vietnam", stadiumName:"19 tháng 8",              founded:1975, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
  ],

  // ═══════════ J1 LEAGUE (18 teams) ═══════════
  "J1 League": [
    { name:"Gamba Osaka",            shortName:"GAM",  country:"Japan", stadiumName:"Panasonic Stadium Suita",    founded:1980, primaryColor:"#003DA5", secondaryColor:"#000000" },
    { name:"Kawasaki Frontale",      shortName:"KAW",  country:"Japan", stadiumName:"Todoroki Athletics",        founded:1955, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Urawa Red Diamonds",     shortName:"URA",  country:"Japan", stadiumName:"Saitama Stadium 2002",      founded:1950, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"Yokohama F.Marinos",     shortName:"YFM",  country:"Japan", stadiumName:"Nissan Stadium",            founded:1972, primaryColor:"#003DA5", secondaryColor:"#CC0000" },
    { name:"Nagoya Grampus",         shortName:"NAG",  country:"Japan", stadiumName:"Toyota Stadium",            founded:1939, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"Sanfrecce Hiroshima",    shortName:"SAN",  country:"Japan", stadiumName:"Edion Peace Wing",          founded:1938, primaryColor:"#4B0082", secondaryColor:"#FFFFFF" },
    { name:"Cerezo Osaka",           shortName:"CER",  country:"Japan", stadiumName:"Yodokou Sakura Stadium",    founded:1957, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Vissel Kobe",            shortName:"VIS",  country:"Japan", stadiumName:"INAC Kobe Wing Stadium",    founded:1966, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"Kashima Antlers",        shortName:"KAS",  country:"Japan", stadiumName:"Kashima Soccer Stadium",    founded:1947, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"FC Tokyo",               shortName:"FCT",  country:"Japan", stadiumName:"Ajinomoto Stadium",         founded:1935, primaryColor:"#003DA5", secondaryColor:"#CC0000" },
    { name:"Kashiwa Reysol",         shortName:"KAR",  country:"Japan", stadiumName:"Sankyo Frontier Kashiwa",   founded:1940, primaryColor:"#FFD700", secondaryColor:"#000000" },
    { name:"Shonan Bellmare",        shortName:"SHO",  country:"Japan", stadiumName:"Lemon Gas Stadium",         founded:1994, primaryColor:"#009900", secondaryColor:"#FFFFFF" },
    { name:"Avispa Fukuoka",         shortName:"AVI",  country:"Japan", stadiumName:"Best Denki Stadium",        founded:1982, primaryColor:"#003DA5", secondaryColor:"#CC0000" },
    { name:"Consadole Sapporo",      shortName:"CON",  country:"Japan", stadiumName:"Sapporo Dome",              founded:1996, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"Albirex Niigata",        shortName:"ALB",  country:"Japan", stadiumName:"Denka Big Swan",            founded:1955, primaryColor:"#F36F21", secondaryColor:"#000000" },
    { name:"Júbilo Iwata",           shortName:"JUB",  country:"Japan", stadiumName:"Yamaha Stadium",            founded:1994, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Shimizu S-Pulse",        shortName:"SHI",  country:"Japan", stadiumName:"IAI Stadium Nihondaira",    founded:1991, primaryColor:"#F36F21", secondaryColor:"#003DA5" },
    { name:"Tokushima Vortis",       shortName:"TOK",  country:"Japan", stadiumName:"Naruto Pokkari Sweat",      founded:1948, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
  ],

  // ═══════════ K LEAGUE 1 (12 teams) ═══════════
  "K League 1": [
    { name:"Jeonbuk Hyundai Motors", shortName:"JBK",  country:"South Korea", stadiumName:"Jeonju World Cup Stadium",founded:1994, primaryColor:"#006600", secondaryColor:"#FFD700" },
    { name:"Ulsan Hyundai",          shortName:"ULS",  country:"South Korea", stadiumName:"Munsu Football Stadium",  founded:1983, primaryColor:"#003DA5", secondaryColor:"#FFD700" },
    { name:"FC Seoul",               shortName:"FCS",  country:"South Korea", stadiumName:"Seoul World Cup Stadium",  founded:1983, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"Suwon Samsung Bluewings",shortName:"SSB",  country:"South Korea", stadiumName:"Suwon World Cup Stadium",  founded:1995, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Pohang Steelers",        shortName:"POH",  country:"South Korea", stadiumName:"Steelyard",                founded:1973, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"Daegu FC",               shortName:"DFC",  country:"South Korea", stadiumName:"DGB Daegu Bank Park",     founded:2002, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Jeju United",            shortName:"JEJ",  country:"South Korea", stadiumName:"Jeju World Cup Stadium",   founded:1982, primaryColor:"#F36F21", secondaryColor:"#000000" },
    { name:"Incheon United",         shortName:"INC",  country:"South Korea", stadiumName:"Incheon Football Stadium", founded:2003, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Gangwon FC",             shortName:"GAN",  country:"South Korea", stadiumName:"Chuncheon Songam Sports",  founded:2008, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Gyeongnam FC",           shortName:"GYE",  country:"South Korea", stadiumName:"Changwon Football Center", founded:2006, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Daejeon Citizen",        shortName:"DAJ",  country:"South Korea", stadiumName:"Daejeon World Cup Stadium",founded:1997, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Seongnam FC",            shortName:"SEO",  country:"South Korea", stadiumName:"Tancheon Sports Complex",  founded:1989, primaryColor:"#000000", secondaryColor:"#FFD700" },
  ],

  // ═══════════ MLS (15 teams) ═══════════
  "MLS": [
    { name:"LA Galaxy",              shortName:"LAG",  country:"USA", stadiumName:"Dignity Health Sports Park",    founded:1996, primaryColor:"#00245D", secondaryColor:"#FFD700" },
    { name:"LAFC",                   shortName:"LAFC", country:"USA", stadiumName:"BMO Stadium",                   founded:2014, primaryColor:"#000000", secondaryColor:"#C39E6D" },
    { name:"Seattle Sounders FC",    shortName:"SEA",  country:"USA", stadiumName:"Lumen Field",                   founded:2007, primaryColor:"#005695", secondaryColor:"#5B9F2B" },
    { name:"Portland Timbers",       shortName:"POR",  country:"USA", stadiumName:"Providence Park",               founded:1975, primaryColor:"#004812", secondaryColor:"#EBE72B" },
    { name:"Atlanta United",         shortName:"ATU",  country:"USA", stadiumName:"Mercedes-Benz Stadium",         founded:2014, primaryColor:"#80000A", secondaryColor:"#9C9C9C" },
    { name:"New York City FC",       shortName:"NYC",  country:"USA", stadiumName:"Yankee Stadium",                founded:2013, primaryColor:"#6CACE4", secondaryColor:"#00285E" },
    { name:"New England Revolution", shortName:"NER",  country:"USA", stadiumName:"Gillette Stadium",              founded:1994, primaryColor:"#C63323", secondaryColor:"#003087" },
    { name:"Orlando City SC",        shortName:"ORL",  country:"USA", stadiumName:"Inter&Co Stadium",              founded:2010, primaryColor:"#633492", secondaryColor:"#F9A21A" },
    { name:"Colorado Rapids",        shortName:"COL",  country:"USA", stadiumName:"Dick's Sporting Goods Park",    founded:1995, primaryColor:"#960A2C", secondaryColor:"#9DC2EA" },
    { name:"Chicago Fire FC",        shortName:"CHI",  country:"USA", stadiumName:"Soldier Field",                 founded:1997, primaryColor:"#CC0000", secondaryColor:"#0055A7" },
    { name:"FC Dallas",              shortName:"DAL",  country:"USA", stadiumName:"Toyota Stadium",                founded:1995, primaryColor:"#CC0000", secondaryColor:"#003087" },
    { name:"Houston Dynamo",         shortName:"HOU",  country:"USA", stadiumName:"Shell Energy Stadium",          founded:2005, primaryColor:"#F36F21", secondaryColor:"#000000" },
    { name:"Inter Miami CF",         shortName:"MIA",  country:"USA", stadiumName:"DRV PNK Stadium",               founded:2018, primaryColor:"#F7B5CD", secondaryColor:"#000000" },
    { name:"Real Salt Lake",         shortName:"RSL",  country:"USA", stadiumName:"America First Field",           founded:2004, primaryColor:"#7C1B2F", secondaryColor:"#003DA5" },
    { name:"Minnesota United",       shortName:"MIN",  country:"USA", stadiumName:"Allianz Field",                 founded:2015, primaryColor:"#8CD2F4", secondaryColor:"#3E3E3E" },
  ],

  // ═══════════ BRASILEIRÃO (16 teams) ═══════════
  "Brasileirão": [
    { name:"CR Flamengo",            shortName:"FLA",  country:"Brazil", stadiumName:"Maracanã",                   founded:1895, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"São Paulo FC",           shortName:"SPO2", country:"Brazil", stadiumName:"MorumBIS",                   founded:1935, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"SE Palmeiras",           shortName:"PAL",  country:"Brazil", stadiumName:"Allianz Parque",             founded:1914, primaryColor:"#006600", secondaryColor:"#FFFFFF" },
    { name:"SC Corinthians",         shortName:"COR",  country:"Brazil", stadiumName:"Neo Química Arena",          founded:1910, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"Grêmio FBPA",            shortName:"GRE",  country:"Brazil", stadiumName:"Arena do Grêmio",            founded:1903, primaryColor:"#003DA5", secondaryColor:"#000000" },
    { name:"Sport Club Internacional",shortName:"INT2",country:"Brazil", stadiumName:"Estádio Beira-Rio",          founded:1909, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"CA Paranaense",          shortName:"CAP",  country:"Brazil", stadiumName:"Arena da Baixada",           founded:1924, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"Atlético Mineiro",       shortName:"CAM",  country:"Brazil", stadiumName:"Arena MRV",                  founded:1908, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"Fluminense FC",          shortName:"FLU",  country:"Brazil", stadiumName:"Maracanã",                   founded:1902, primaryColor:"#9B1B30", secondaryColor:"#003DA5" },
    { name:"Santos FC",              shortName:"SAN2", country:"Brazil", stadiumName:"Vila Belmiro",               founded:1912, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"Botafogo de FR",         shortName:"BOT",  country:"Brazil", stadiumName:"Nilton Santos",              founded:1894, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"Cruzeiro EC",            shortName:"CRU",  country:"Brazil", stadiumName:"Mineirão",                   founded:1921, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Vasco da Gama",          shortName:"VAS",  country:"Brazil", stadiumName:"São Januário",               founded:1898, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"Bahia",                  shortName:"BAH",  country:"Brazil", stadiumName:"Arena Fonte Nova",           founded:1931, primaryColor:"#003DA5", secondaryColor:"#CC0000" },
    { name:"Fortaleza EC",           shortName:"FOR",  country:"Brazil", stadiumName:"Arena Castelão",             founded:1918, primaryColor:"#003DA5", secondaryColor:"#CC0000" },
    { name:"América FC",             shortName:"AME",  country:"Brazil", stadiumName:"Arena Independência",        founded:1912, primaryColor:"#006600", secondaryColor:"#FFFFFF" },
  ],

  // ═══════════ SAUDI PRO LEAGUE (18 teams) ═══════════
  "Saudi Pro League": [
    { name:"Al Hilal SFC",           shortName:"HIL",  country:"Saudi Arabia", stadiumName:"Kingdom Arena",             founded:1957, primaryColor:"#174094", secondaryColor:"#FFFFFF" },
    { name:"Al Nassr FC",            shortName:"NAS",  country:"Saudi Arabia", stadiumName:"Mrsool Park",               founded:1955, primaryColor:"#F5AE13", secondaryColor:"#013EA4" },
    { name:"Al Ittihad Club",        shortName:"ITT",  country:"Saudi Arabia", stadiumName:"King Abdullah Sports City", founded:1927, primaryColor:"#F5C400", secondaryColor:"#000000" },
    { name:"Al Ahli Saudi FC",       shortName:"AHL",  country:"Saudi Arabia", stadiumName:"King Abdullah Sports City", founded:1937, primaryColor:"#006F3C", secondaryColor:"#FFFFFF" },
    { name:"Al Shabab FC",           shortName:"SHB",  country:"Saudi Arabia", stadiumName:"Prince Faisal Fahd",        founded:1947, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Al Qadsiah",             shortName:"QAD",  country:"Saudi Arabia", stadiumName:"Prince Mohamed bin Fahd",   founded:1945, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Al Faysaly",             shortName:"FAY",  country:"Saudi Arabia", stadiumName:"Prince Abdullah Al Faisal", founded:1932, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Damac FC",               shortName:"DAM",  country:"Saudi Arabia", stadiumName:"Prince Sultan",             founded:1966, primaryColor:"#FFD700", secondaryColor:"#000000" },
    { name:"Al Fateh",               shortName:"FAT",  country:"Saudi Arabia", stadiumName:"Prince Abdullah bin Jalawi",founded:1958, primaryColor:"#009900", secondaryColor:"#000000" },
    { name:"Al Hazem",               shortName:"HAZ",  country:"Saudi Arabia", stadiumName:"Prince Abdullah bin Jalawi",founded:1955, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Al Taawoun FC",          shortName:"TAA",  country:"Saudi Arabia", stadiumName:"King Abdullah Sport City",  founded:1979, primaryColor:"#009900", secondaryColor:"#FFD700" },
    { name:"Al Riyadh",              shortName:"RIY",  country:"Saudi Arabia", stadiumName:"Prince Faisal Fahd",        founded:1954, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Al Raed",                shortName:"RAE",  country:"Saudi Arabia", stadiumName:"Prince Sultan Bin Abdul",   founded:1976, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Abha Club",              shortName:"ABH",  country:"Saudi Arabia", stadiumName:"Abha Club Stadium",         founded:1930, primaryColor:"#009900", secondaryColor:"#FFFFFF" },
    { name:"Al Wehda",               shortName:"WEH",  country:"Saudi Arabia", stadiumName:"King Abdulaziz",            founded:1945, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Al Ettifaq",             shortName:"ETT",  country:"Saudi Arabia", stadiumName:"Prince Mohammed bin Fahd",  founded:1945, primaryColor:"#F5AE13", secondaryColor:"#000000" },
    { name:"Al Khaleej",             shortName:"KHA",  country:"Saudi Arabia", stadiumName:"Sager Stadium",             founded:1939, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
    { name:"Al Okhdood",             shortName:"OKH",  country:"Saudi Arabia", stadiumName:"King Saud University",      founded:1984, primaryColor:"#003DA5", secondaryColor:"#FFFFFF" },
  ],

  // ═══════════ CAF CHAMPIONS LEAGUE (16 teams) ═══════════
  "CAF Champions League": [
    { name:"Al Ahly SC",             shortName:"AHA",  country:"Egypt",        stadiumName:"Al-Ahly WE Al Salam",       founded:1907, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Wydad Athletic Club",    shortName:"WAC",  country:"Morocco",      stadiumName:"Stade Mohammed V",          founded:1937, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Espérance de Tunis",     shortName:"EST",  country:"Tunisia",      stadiumName:"Stade de Radès",            founded:1919, primaryColor:"#CC0000", secondaryColor:"#FFD700" },
    { name:"Mamelodi Sundowns",      shortName:"SUN",  country:"South Africa", stadiumName:"Loftus Versfeld",           founded:1970, primaryColor:"#003DA5", secondaryColor:"#FFD700" },
    { name:"TP Mazembe",             shortName:"TPM",  country:"DR Congo",     stadiumName:"Stade TP Mazembe",          founded:1939, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"Zamalek SC",             shortName:"ZAM",  country:"Egypt",        stadiumName:"Cairo International",       founded:1911, primaryColor:"#FFFFFF", secondaryColor:"#CC0000" },
    { name:"Orlando Pirates",        shortName:"ORP",  country:"South Africa", stadiumName:"Orlando Stadium",           founded:1937, primaryColor:"#000000", secondaryColor:"#FFFFFF" },
    { name:"ASEC Mimosas",           shortName:"ASC",  country:"Ivory Coast",  stadiumName:"Félix Houphouët-Boigny",    founded:1948, primaryColor:"#FFD700", secondaryColor:"#000000" },
    { name:"MC Alger",               shortName:"MCA",  country:"Algeria",      stadiumName:"Stade Omar Hamadi",         founded:1921, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"USM Alger",              shortName:"USM",  country:"Algeria",      stadiumName:"Stade du 5 Juillet 1962",   founded:1937, primaryColor:"#CC0000", secondaryColor:"#000000" },
    { name:"ES Sahel",               shortName:"ESS",  country:"Tunisia",      stadiumName:"Stade olympique de Sousse", founded:1925, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Al Merrikh",             shortName:"ALM2", country:"Sudan",        stadiumName:"Al Merrikh Stadium",        founded:1909, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"ASFA Yennenga",          shortName:"ASY",  country:"Burkina Faso", stadiumName:"Stade du 4 Août",           founded:1946, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Raja Casablanca",        shortName:"RAJ",  country:"Morocco",      stadiumName:"Stade Mohammed V",          founded:1949, primaryColor:"#006600", secondaryColor:"#FFFFFF" },
    { name:"Club Africain",          shortName:"CAF2", country:"Tunisia",      stadiumName:"Stade El Menzah",           founded:1920, primaryColor:"#CC0000", secondaryColor:"#FFFFFF" },
    { name:"Kaizer Chiefs",          shortName:"KAI",  country:"South Africa", stadiumName:"FNB Stadium",               founded:1970, primaryColor:"#FFD700", secondaryColor:"#000000" },
  ],

  // ═══════════ FIFA WORLD CUP (32 national teams) ═══════════
  "FIFA World Cup": [
    { name:"Brazil",       shortName:"BRA", country:"Brazil",         stadiumName:"Maracanã",                  founded:1914, primaryColor:"#009C3B", secondaryColor:"#FFDF00", type:"national", region:"Americas" },
    { name:"Argentina",    shortName:"ARG", country:"Argentina",      stadiumName:"Estadio Monumental",        founded:1893, primaryColor:"#74ACDF", secondaryColor:"#FFFFFF",  type:"national", region:"Americas" },
    { name:"France",       shortName:"FRA", country:"France",         stadiumName:"Stade de France",           founded:1919, primaryColor:"#002395", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Germany",      shortName:"GER", country:"Germany",        stadiumName:"Allianz Arena",             founded:1900, primaryColor:"#000000", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Spain",        shortName:"ESP", country:"Spain",          stadiumName:"Estadio La Cartuja",        founded:1909, primaryColor:"#AA151B", secondaryColor:"#F1BF00",  type:"national", region:"Europe" },
    { name:"England",      shortName:"ENG", country:"England",        stadiumName:"Wembley Stadium",           founded:1863, primaryColor:"#FFFFFF",  secondaryColor:"#003090", type:"national", region:"Europe" },
    { name:"Portugal",     shortName:"POR", country:"Portugal",       stadiumName:"Estádio da Luz",            founded:1914, primaryColor:"#006600",  secondaryColor:"#FF0000", type:"national", region:"Europe" },
    { name:"Vietnam",      shortName:"VIE", country:"Vietnam",        stadiumName:"Mỹ Đình",                   founded:1962, primaryColor:"#DA251D",  secondaryColor:"#FFCD00", type:"national", region:"Asia" },
    { name:"Japan",        shortName:"JPN", country:"Japan",          stadiumName:"Japan National Stadium",    founded:1921, primaryColor:"#000080",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"South Korea",  shortName:"KOR", country:"South Korea",    stadiumName:"Seoul World Cup Stadium",   founded:1928, primaryColor:"#003DA5",  secondaryColor:"#FF0000", type:"national", region:"Asia" },
    { name:"USA",          shortName:"USA", country:"USA",            stadiumName:"MetLife Stadium",           founded:1913, primaryColor:"#002868",  secondaryColor:"#BF0A30", type:"national", region:"Americas" },
    { name:"Mexico",       shortName:"MEX", country:"Mexico",         stadiumName:"Estadio Azteca",            founded:1927, primaryColor:"#006847",  secondaryColor:"#CE1126", type:"national", region:"Americas" },
    { name:"Netherlands",  shortName:"NED", country:"Netherlands",    stadiumName:"Johan Cruyff Arena",        founded:1889, primaryColor:"#FF4E00",  secondaryColor:"#FFFFFF", type:"national", region:"Europe" },
    { name:"Italy",        shortName:"ITA", country:"Italy",          stadiumName:"Stadio Olimpico",           founded:1898, primaryColor:"#003DA5",  secondaryColor:"#FFFFFF", type:"national", region:"Europe" },
    { name:"Belgium",      shortName:"BEL", country:"Belgium",        stadiumName:"King Baudouin Stadium",     founded:1895, primaryColor:"#CC0000",  secondaryColor:"#000000", type:"national", region:"Europe" },
    { name:"Uruguay",      shortName:"URU", country:"Uruguay",        stadiumName:"Estadio Centenario",        founded:1900, primaryColor:"#003DA5",  secondaryColor:"#FFFFFF", type:"national", region:"Americas" },
    { name:"Croatia",      shortName:"CRO", country:"Croatia",        stadiumName:"Stadion Maksimir",          founded:1912, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Europe" },
    { name:"Morocco",      shortName:"MAR", country:"Morocco",        stadiumName:"Complexe Mohammed V",       founded:1955, primaryColor:"#CC0000",  secondaryColor:"#006233", type:"national", region:"Africa" },
    { name:"Senegal",      shortName:"SEN", country:"Senegal",        stadiumName:"Léopold Sédar Senghor",     founded:1960, primaryColor:"#00853F",  secondaryColor:"#FFD700", type:"national", region:"Africa" },
    { name:"Australia",    shortName:"AUS", country:"Australia",      stadiumName:"Stadium Australia",         founded:1961, primaryColor:"#FFD700",  secondaryColor:"#003DA5", type:"national", region:"Asia" },
    { name:"Canada",       shortName:"CAN", country:"Canada",         stadiumName:"BMO Field",                 founded:1912, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Americas" },
    { name:"Saudi Arabia", shortName:"SAU", country:"Saudi Arabia",   stadiumName:"King Fahd Stadium",         founded:1959, primaryColor:"#006233",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Iran",         shortName:"IRN", country:"Iran",           stadiumName:"Azadi Stadium",             founded:1920, primaryColor:"#239F40",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Poland",       shortName:"POL", country:"Poland",         stadiumName:"PGE Narodowy",              founded:1919, primaryColor:"#FFFFFF",  secondaryColor:"#DC143C", type:"national", region:"Europe" },
    { name:"Switzerland",  shortName:"SUI", country:"Switzerland",    stadiumName:"Wankdorf Stadium",          founded:1895, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Europe" },
    { name:"Denmark",      shortName:"DEN", country:"Denmark",        stadiumName:"Parken Stadium",            founded:1889, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Europe" },
    { name:"Ghana",        shortName:"GHA", country:"Ghana",          stadiumName:"Baba Yara Stadium",         founded:1957, primaryColor:"#006B3F",  secondaryColor:"#FFD700", type:"national", region:"Africa" },
    { name:"Cameroon",     shortName:"CMR", country:"Cameroon",       stadiumName:"Stade Omnisports",          founded:1959, primaryColor:"#007A5E",  secondaryColor:"#CC0000", type:"national", region:"Africa" },
    { name:"Tunisia",      shortName:"TUN", country:"Tunisia",        stadiumName:"Stade de Radès",            founded:1956, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Africa" },
    { name:"Ecuador",      shortName:"ECU", country:"Ecuador",        stadiumName:"Estadio Rodrigo Paz",       founded:1925, primaryColor:"#FFD700",  secondaryColor:"#003DA5", type:"national", region:"Americas" },
    { name:"Qatar",        shortName:"QAT", country:"Qatar",          stadiumName:"Lusail Stadium",            founded:1960, primaryColor:"#8B1538",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Costa Rica",   shortName:"CRC", country:"Costa Rica",     stadiumName:"Estadio Nacional",          founded:1921, primaryColor:"#CC0000",  secondaryColor:"#003DA5", type:"national", region:"Americas" },
  ],

  // ═══════════ AFC ASIAN CUP (24 national teams) ═══════════
  "AFC Asian Cup": [
    { name:"Japan NT",     shortName:"JPNX", country:"Japan",        stadiumName:"Japan National Stadium", founded:1921, primaryColor:"#000080",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"South Korea NT",shortName:"KORX",country:"South Korea", stadiumName:"Seoul World Cup Stadium",founded:1928, primaryColor:"#003DA5",  secondaryColor:"#FF0000", type:"national", region:"Asia" },
    { name:"Saudi Arabia NT",shortName:"SAUX",country:"Saudi Arabia",stadiumName:"King Fahd Stadium",     founded:1959, primaryColor:"#006233",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Iran NT",      shortName:"IRNX", country:"Iran",        stadiumName:"Azadi Stadium",          founded:1920, primaryColor:"#239F40",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Australia NT", shortName:"AUSX", country:"Australia",   stadiumName:"Stadium Australia",      founded:1961, primaryColor:"#FFD700",  secondaryColor:"#003DA5", type:"national", region:"Asia" },
    { name:"Qatar NT",     shortName:"QATX", country:"Qatar",       stadiumName:"Lusail Stadium",         founded:1960, primaryColor:"#8B1538",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Vietnam NT",   shortName:"VIEX", country:"Vietnam",     stadiumName:"Mỹ Đình",                founded:1962, primaryColor:"#DA251D",  secondaryColor:"#FFCD00", type:"national", region:"Asia" },
    { name:"China NT",     shortName:"CHN",  country:"China",       stadiumName:"Shanghai Stadium",       founded:1924, primaryColor:"#DE2910",  secondaryColor:"#FFDE00", type:"national", region:"Asia" },
    { name:"Iraq NT",      shortName:"IRQ",  country:"Iraq",        stadiumName:"Franso Hariri Stadium",  founded:1948, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Jordan NT",    shortName:"JOR",  country:"Jordan",      stadiumName:"King Abdullah II",       founded:1949, primaryColor:"#007A3D",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"UAE NT",       shortName:"UAE",  country:"UAE",         stadiumName:"Zayed Sports City",      founded:1971, primaryColor:"#00732F",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Uzbekistan NT",shortName:"UZB",  country:"Uzbekistan",  stadiumName:"Pakhtakor Markaziy",     founded:1946, primaryColor:"#003DA5",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Tajikistan NT",shortName:"TJK",  country:"Tajikistan",  stadiumName:"Pamir Stadium",          founded:1992, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"India NT",     shortName:"IND",  country:"India",       stadiumName:"Jawaharlal Nehru",       founded:1937, primaryColor:"#003DA5",  secondaryColor:"#FF9900", type:"national", region:"Asia" },
    { name:"Bahrain NT",   shortName:"BHR",  country:"Bahrain",     stadiumName:"National Stadium",       founded:1957, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Kyrgyzstan NT",shortName:"KGZ",  country:"Kyrgyzstan",  stadiumName:"Dolen Omurzakov",        founded:1992, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Oman NT",      shortName:"OMA",  country:"Oman",        stadiumName:"Sultan Qaboos Sports",   founded:1978, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Thailand NT",  shortName:"THA2", country:"Thailand",    stadiumName:"Rajamangala National",   founded:1916, primaryColor:"#003DA5",  secondaryColor:"#CC0000", type:"national", region:"Asia" },
    { name:"Malaysia NT",  shortName:"MAS",  country:"Malaysia",    stadiumName:"Bukit Jalil National",   founded:1933, primaryColor:"#CC0000",  secondaryColor:"#FFD700", type:"national", region:"Asia" },
    { name:"Indonesia NT", shortName:"IDN",  country:"Indonesia",   stadiumName:"Gelora Bung Karno",      founded:1930, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Philippines NT",shortName:"PHI", country:"Philippines", stadiumName:"Philippine Arena",       founded:1907, primaryColor:"#003DA5",  secondaryColor:"#CC0000", type:"national", region:"Asia" },
    { name:"Syria NT",     shortName:"SYR",  country:"Syria",       stadiumName:"Abbasiyyin Stadium",     founded:1936, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Palestine NT", shortName:"PST",  country:"Palestine",   stadiumName:"Faisal Al-Husseini",     founded:1928, primaryColor:"#CC0000",  secondaryColor:"#FFFFFF", type:"national", region:"Asia" },
    { name:"Kuwait NT",    shortName:"KUW",  country:"Kuwait",      stadiumName:"Kuwait National",        founded:1952, primaryColor:"#007A3D",  secondaryColor:"#CC0000", type:"national", region:"Asia" },
  ],

  // ═══════════ COPA AMÉRICA (16 national teams) ═══════════
  "Copa América": [
    { name:"Brazil CA",    shortName:"BRAY", country:"Brazil",      stadiumName:"Maracanã",               founded:1914, primaryColor:"#009C3B", secondaryColor:"#FFDF00", type:"national", region:"Americas" },
    { name:"Argentina CA", shortName:"ARGY", country:"Argentina",   stadiumName:"Estadio Monumental",     founded:1893, primaryColor:"#74ACDF", secondaryColor:"#FFFFFF",  type:"national", region:"Americas" },
    { name:"Uruguay CA",   shortName:"URUY", country:"Uruguay",     stadiumName:"Estadio Centenario",     founded:1900, primaryColor:"#003DA5", secondaryColor:"#FFFFFF",  type:"national", region:"Americas" },
    { name:"Chile",        shortName:"CHI",  country:"Chile",       stadiumName:"Estadio Nacional",       founded:1895, primaryColor:"#CC0000", secondaryColor:"#FFFFFF",  type:"national", region:"Americas" },
    { name:"Colombia",     shortName:"COL2", country:"Colombia",    stadiumName:"El Campín",              founded:1924, primaryColor:"#FFD700", secondaryColor:"#CC0000",  type:"national", region:"Americas" },
    { name:"Peru",         shortName:"PER",  country:"Peru",        stadiumName:"Estadio Nacional",       founded:1922, primaryColor:"#CC0000", secondaryColor:"#FFFFFF",  type:"national", region:"Americas" },
    { name:"Ecuador CA",   shortName:"ECUY", country:"Ecuador",     stadiumName:"Estadio Rodrigo Paz",    founded:1925, primaryColor:"#FFD700", secondaryColor:"#003DA5",  type:"national", region:"Americas" },
    { name:"Paraguay",     shortName:"PAR",  country:"Paraguay",    stadiumName:"Estadio Defensores",     founded:1906, primaryColor:"#CC0000", secondaryColor:"#003DA5",  type:"national", region:"Americas" },
    { name:"Bolivia",      shortName:"BOL",  country:"Bolivia",     stadiumName:"Hernando Siles",         founded:1925, primaryColor:"#CC0000", secondaryColor:"#FFD700",  type:"national", region:"Americas" },
    { name:"Venezuela",    shortName:"VEN",  country:"Venezuela",   stadiumName:"Estadio Metropolitano",  founded:1926, primaryColor:"#CC0000", secondaryColor:"#FFD700",  type:"national", region:"Americas" },
    { name:"Mexico CA",    shortName:"MEXY", country:"Mexico",      stadiumName:"Estadio Azteca",         founded:1927, primaryColor:"#006847", secondaryColor:"#CE1126",  type:"national", region:"Americas" },
    { name:"USA CA",       shortName:"USAY", country:"USA",         stadiumName:"MetLife Stadium",        founded:1913, primaryColor:"#002868", secondaryColor:"#BF0A30",  type:"national", region:"Americas" },
    { name:"Canada CA",    shortName:"CANY", country:"Canada",      stadiumName:"BMO Field",              founded:1912, primaryColor:"#CC0000", secondaryColor:"#FFFFFF",  type:"national", region:"Americas" },
    { name:"Jamaica",      shortName:"JAM",  country:"Jamaica",     stadiumName:"National Stadium",       founded:1910, primaryColor:"#FFD700", secondaryColor:"#000000",  type:"national", region:"Americas" },
    { name:"Panama",       shortName:"PAN",  country:"Panama",      stadiumName:"Estadio Rommel Fernández",founded:1937,primaryColor:"#CC0000", secondaryColor:"#003DA5",  type:"national", region:"Americas" },
    { name:"Costa Rica CA",shortName:"CRCY", country:"Costa Rica",  stadiumName:"Estadio Nacional",       founded:1921, primaryColor:"#CC0000", secondaryColor:"#003DA5",  type:"national", region:"Americas" },
  ],

  // ═══════════ UEFA NATIONS LEAGUE (16 teams) ═══════════
  "UEFA Nations League": [
    { name:"Spain UNL",    shortName:"ESPU", country:"Spain",       stadiumName:"Estadio La Cartuja",     founded:1909, primaryColor:"#AA151B", secondaryColor:"#F1BF00",  type:"national", region:"Europe" },
    { name:"France UNL",   shortName:"FRAU", country:"France",      stadiumName:"Stade de France",        founded:1919, primaryColor:"#002395", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Germany UNL",  shortName:"GERU", country:"Germany",     stadiumName:"Allianz Arena",          founded:1900, primaryColor:"#000000", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Portugal UNL", shortName:"PORU", country:"Portugal",    stadiumName:"Estádio da Luz",         founded:1914, primaryColor:"#006600", secondaryColor:"#FF0000",  type:"national", region:"Europe" },
    { name:"England UNL",  shortName:"ENGU", country:"England",     stadiumName:"Wembley Stadium",        founded:1863, primaryColor:"#FFFFFF",  secondaryColor:"#003090", type:"national", region:"Europe" },
    { name:"Netherlands UNL",shortName:"NEDU",country:"Netherlands",stadiumName:"Johan Cruyff Arena",     founded:1889, primaryColor:"#FF4E00", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Italy UNL",    shortName:"ITAU", country:"Italy",       stadiumName:"Stadio Olimpico",        founded:1898, primaryColor:"#003DA5", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Belgium UNL",  shortName:"BELU", country:"Belgium",     stadiumName:"King Baudouin Stadium",  founded:1895, primaryColor:"#CC0000", secondaryColor:"#000000",  type:"national", region:"Europe" },
    { name:"Croatia UNL",  shortName:"CROU", country:"Croatia",     stadiumName:"Stadion Maksimir",       founded:1912, primaryColor:"#CC0000", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Switzerland UNL",shortName:"SUIU",country:"Switzerland",stadiumName:"Wankdorf Stadium",       founded:1895, primaryColor:"#CC0000", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Denmark UNL",  shortName:"DENU", country:"Denmark",     stadiumName:"Parken Stadium",         founded:1889, primaryColor:"#CC0000", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Austria",      shortName:"AUT",  country:"Austria",     stadiumName:"Ernst Happel Stadion",   founded:1904, primaryColor:"#CC0000", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Turkey",       shortName:"TUR",  country:"Turkey",      stadiumName:"Atatürk Olympic",        founded:1923, primaryColor:"#CC0000", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
    { name:"Serbia",       shortName:"SRB",  country:"Serbia",      stadiumName:"Rajko Mitić",            founded:1919, primaryColor:"#CC0000", secondaryColor:"#003DA5",  type:"national", region:"Europe" },
    { name:"Hungary",      shortName:"HUN",  country:"Hungary",     stadiumName:"Puskás Aréna",           founded:1901, primaryColor:"#CC0000", secondaryColor:"#009966",  type:"national", region:"Europe" },
    { name:"Scotland",     shortName:"SCO",  country:"Scotland",    stadiumName:"Hampden Park",           founded:1872, primaryColor:"#003DA5", secondaryColor:"#FFFFFF",  type:"national", region:"Europe" },
  ],
};

// ── KNOWN PLAYERS (11 per team) ───────────────────────────────────────────────
const KNOWN_PLAYERS: Record<string, string[]> = {
  // ── PREMIER LEAGUE ──
  "Arsenal FC":             ["David Raya","Ben White","Gabriel Magalhães","Oleksandr Zinchenko","Jurriën Timber","Thomas Partey","Martin Ødegaard","Declan Rice","Leandro Trossard","Bukayo Saka","Kai Havertz"],
  "Chelsea FC":             ["Robert Sánchez","Reece James","Levi Colwill","Ben Chilwell","Wesley Fofana","Moisés Caicedo","Enzo Fernández","Cole Palmer","Pedro Neto","Noni Madueke","Nicolas Jackson"],
  "Manchester City":        ["Ederson","Kyle Walker","Rúben Dias","Manuel Akanji","Josko Gvardiol","Rodri","Kevin De Bruyne","Bernardo Silva","Jack Grealish","Phil Foden","Erling Haaland"],
  "Manchester United":      ["André Onana","Diogo Dalot","Raphaël Varane","Lisandro Martínez","Luke Shaw","Casemiro","Bruno Fernandes","Mason Mount","Marcus Rashford","Antony","Rasmus Højlund"],
  "Liverpool FC":           ["Alisson Becker","Trent Alexander-Arnold","Virgil van Dijk","Ibrahima Konaté","Andrew Robertson","Alexis Mac Allister","Dominik Szoboszlai","Curtis Jones","Luis Díaz","Mohamed Salah","Darwin Núñez"],
  "Tottenham Hotspur":      ["Guglielmo Vicario","Pedro Porro","Micky van de Ven","Cristian Romero","Destiny Udogie","Pierre-Emile Højbjerg","Yves Bissouma","James Maddison","Dejan Kulusevski","Brennan Johnson","Son Heung-min"],
  "Aston Villa":            ["Emiliano Martínez","Matty Cash","Pau Torres","Ezri Konsa","Alex Moreno","Douglas Luiz","John McGinn","Emiliano Buendía","Leon Bailey","Moussa Diaby","Ollie Watkins"],
  "Newcastle United":       ["Nick Pope","Kieran Trippier","Sven Botman","Fabian Schär","Dan Burn","Bruno Guimarães","Joelinton","Sean Longstaff","Harvey Barnes","Anthony Gordon","Alexander Isak"],
  "Brighton & Hove Albion": ["Bart Verbruggen","Jan Paul van Hecke","Lewis Dunk","Joël Veltman","Pervis Estupiñán","Adam Webster","Mats Wieffer","Pascal Groß","Julio Enciso","Kaoru Mitoma","Danny Welbeck"],
  "West Ham United":        ["Alphonse Areola","Ben Johnson","Kurt Zouma","Nayef Aguerd","Emerson","Tomáš Souček","James Ward-Prowse","Lucas Paquetá","Jarrod Bowen","Mohammed Kudus","Michail Antonio"],
  "Crystal Palace":         ["Dean Henderson","Joel Ward","Marc Guéhi","Joachim Andersen","Tyrick Mitchell","Adam Wharton","Will Hughes","Eberechi Eze","Michael Olise","Jordan Ayew","Jean-Philippe Mateta"],
  "Wolverhampton Wanderers":["José Sá","Matt Doherty","Max Kilman","Toti Gomes","Rayan Aït-Nouri","João Gomes","João Moutinho","Pablo Sarabia","Pedro Neto","Matheus Cunha","Hwang Hee-chan"],
  "Fulham FC":              ["Bernd Leno","Kenny Tete","Tosin Adarabioyo","Tim Ream","Antonee Robinson","Harrison Reed","Tom Cairney","João Palhinha","Bobby De Cordova-Reid","Willian","Raúl Jiménez"],
  "Brentford FC":           ["Mark Flekken","Aaron Hickey","Ben Mee","Ethan Pinnock","Rico Henry","Christian Nørgaard","Mathias Jensen","Vitaly Janelt","Bryan Mbeumo","Yoane Wissa","Ivan Toney"],
  "Nottingham Forest":      ["Matz Sels","Neco Williams","Murillo","Joe Worrall","Harry Toffolo","Orel Mangala","Danilo","Anthony Elanga","Callum Hudson-Odoi","Morgan Gibbs-White","Taiwo Awoniyi"],
  "Everton FC":             ["Jordan Pickford","Séamus Coleman","James Tarkowski","Jarrad Branthwaite","Vitalii Mykolenko","James Garner","Abdoulaye Doucouré","Idrissa Gueye","Dwight McNeil","Demarai Gray","Dominic Calvert-Lewin"],
  "AFC Bournemouth":        ["Mark Travers","Adam Smith","Chris Mepham","Lloyd Kelly","Miloš Kerkez","Lewis Cook","Ryan Christie","Philip Billing","Marcus Tavernier","Antoine Semenyo","Dominic Solanke"],
  "Luton Town":             ["Thomas Kaminski","Amari'i Bell","Tom Lockyer","Kal Naismith","Dan Potts","Pelly-Ruddock Mpanzu","Jordan Clark","Allan Campbell","Tahith Chong","Elijah Adebayo","Carlton Morris"],
  "Sheffield United":       ["Wes Foderingham","Enda Stevens","Chris Basham","John Egan","Max Lowe","Oliver Norwood","John Fleck","Ben Osborn","Rhian Brewster","Oli McBurnie","Jayden Bogle"],
  "Burnley FC":             ["James Trafford","Dara O'Shea","Jordan Beyer","Hannes Delcroix","Charlie Taylor","Josh Cullen","Sander Berge","Luca Koleosho","Anass Zaroury","Zeki Amdouni","Jay Rodriguez"],
  // ── LA LIGA ──
  "Real Madrid CF":         ["Thibaut Courtois","Dani Carvajal","David Alaba","Antonio Rüdiger","Ferland Mendy","Eduardo Camavinga","Toni Kroos","Jude Bellingham","Vinicius Jr","Rodrygo","Kylian Mbappé"],
  "FC Barcelona":           ["Marc-André ter Stegen","Jules Koundé","Ronald Araújo","Pau Cubarsí","Alejandro Balde","Frenkie de Jong","Pedri","Gavi","Raphinha","Lamine Yamal","Robert Lewandowski"],
  "Atletico de Madrid":     ["Jan Oblak","Marcos Llorente","José María Giménez","Mario Hermoso","Reinildo","Koke","Rodrigo De Paul","Thomas Lemar","Saúl Ñíguez","Samuel Lino","Antoine Griezmann"],
  "Sevilla FC":             ["Ørjan Nyland","Gonzalo Montiel","Loïc Badé","Marcos Acuña","Alejandro Pozo","Óliver Torres","Fernando","Bryan Gil","Jesús Navas","Youssef En-Nesyri","Rafa Mir"],
  "Real Sociedad":          ["Álex Remiro","Hamari Traoré","Aritz Elustondo","Nayef Aguerd","Aihen Muñoz","Takefusa Kubo","Martín Zubimendi","Mikel Merino","Ander Barrenetxea","Brais Méndez","Alexander Sørloth"],
  "Villarreal CF":          ["Filip Jörgensen","Alfonso Pedraza","Raúl Albiol","Pervis Estupiñán","Yeremy Pino","Alex Baena","Manu Trigueros","Samuel Chukwueze","Étienne Capoue","Paco Alcácer","Gerard Moreno"],
  "Athletic Club":          ["Unai Simón","Dani Vivian","Yeray Álvarez","Aitor Paredes","Yuri Berchiche","Dani García","Mikel Vesga","Oscar de Marcos","Nico Williams","Iñaki Williams","Gorka Guruzeta"],
  "Real Betis":             ["Rui Silva","Héctor Bellerín","Germán Pezzella","Marc Bartra","Alejandro Moreno","Guido Rodríguez","Sergio Canales","Isco","Joaquín","Borja Iglesias","Ayoze Pérez"],
  "Celta Vigo":             ["Iván Villar","Kevin Vázquez","Unai Núñez","Óscar Mingueza","Jailson","Fran Beltrán","Renato Tapia","Gabri Veiga","Williot Swedberg","Carles Pérez","Iago Aspas"],
  "Osasuna":                ["Sergio Herrera","Nacho Vidal","David García","Aridane","Juan Cruz","Lucas Torró","Moi Gómez","Rubén García","Ezequiel Ávila","Kike García","Ante Budimir"],
  "Rayo Vallecano":         ["Stole Dimitrievski","Iván Balliu","Alejandro Catena","Florian Lejeune","Fran García","Óscar Trejo","Unai López","Álvaro García","Diego López","Randy Nteka","Sergio Camello"],
  "Getafe CF":              ["David Soria","Damián Suárez","Domingos Duarte","Djené Dakonam","Juan Iglesias","Mauro Arambarri","Nemanja Maksimović","Víctor Machín","Mason Greenwood","Borja Mayoral","Enes Ünal"],
  "Girona FC":              ["Paulo Gazzaniga","Arnau Martínez","David López","Santi Bueno","Miguel Gutiérrez","Aleix García","Oriol Romeu","Viktor Tsygankov","Savinho","Yangel Herrera","Artem Dovbyk"],
  "UD Almería":             ["Fernando Martínez","Kaiky","Rodrigo Ely","Edgar González","Alejandro Centelles","Radovanovic","Samu Costa","Leo Baptistão","Largie Ramazani","Luis Suárez","Sergio Akieme"],
  "RCD Mallorca":           ["Predrag Rajković","Pablo Maffeo","Raillo","Martin Valjent","Jaume Costa","Antonio Sánchez","Dani Rodríguez","Cyle Larin","Vedat Muriqi","Lee Kang-in","Abdon Prats"],
  "Granada CF":             ["Luis Maximiano","Ricard Sánchez","Domingos Duarte","Luis Abram","Víctor Díaz","Gonzalo Villar","Manu Sánchez","Bryan Zaragoza","Fabio Silva","Callejón","Jorge Molina"],
  "UD Las Palmas":          ["Álvaro Valles","Álex Suárez","Álex Domínguez","Coco","Álex Muñoz","Sergi Cardona","Jonathan Viera","Mika Mármol","Alberto Moleiro","Sandro Ramírez","Jesé"],
  "Deportivo Alavés":       ["Antonio Sivera","Ruben Duarte","Facundo Alderete","Moussa Diallo","Nahuel Tenaglia","Toni Moya","Borja Sainz","Jon Guridi","Manu García","Mamadou Sylla","Luis Rioja"],
  "Cádiz CF":               ["Jeremías Ledesma","Fali","Jens Jønsson","Iván Alejo","Anthony Barba","Álex Fernández","Rubén Sobrino","Chris Ramos","Brian Ocampo","Álex Bodiger","Lucas Pérez"],
  "Valencia CF":            ["Giorgi Mamardashvili","Thierry Correia","Dimitri Foulquier","Cristhian Mosquera","José Gayà","Yunus Musah","Javi Guerra","Nico González","Hugo Duro","Hugo Guillamón","Pepelu"],
  // ── BUNDESLIGA ──
  "FC Bayern München":      ["Manuel Neuer","Noussair Mazraoui","Min-jae Kim","Matthijs de Ligt","Alphonso Davies","Leon Goretzka","Joshua Kimmich","Jamal Musiala","Kingsley Coman","Thomas Müller","Harry Kane"],
  "Borussia Dortmund":      ["Gregor Kobel","Julian Ryerson","Niklas Süle","Nico Schlotterbeck","Ian Maatsen","Marcel Sabitzer","Emre Can","Felix Nmecha","Karim Adeyemi","Jamie Bynoe-Gittens","Sébastien Haller"],
  "RB Leipzig":             ["Peter Gulácsi","Benjamin Henrichs","Willi Orbán","Lukas Klostermann","David Raum","Xaver Schlager","Kevin Kampl","Dani Olmo","Timo Werner","Lois Openda","André Silva"],
  "Bayer 04 Leverkusen":    ["Lukáš Hrádecký","Jeremie Frimpong","Odilon Kossounou","Jonathan Tah","Alejandro Grimaldo","Robert Andrich","Granit Xhaka","Florian Wirtz","Jonas Hofmann","Amine Adli","Victor Boniface"],
  "Eintracht Frankfurt":    ["Kevin Trapp","Rasmus Kristensen","Tuta","Robin Koch","Philipp Max","Ellyes Skhiri","Mario Götze","Ansgar Knauff","Junior Dina Ebimbe","Hugo Ekitiké","Randal Kolo Muani"],
  "VfB Stuttgart":          ["Fabian Bredlow","Pascal Stenzel","Dan-Axel Zagadou","Konstantinos Mavropanos","Maximilian Mittelstädt","Chris Führich","Wataru Endō","Angelo Stiller","Silas Katompa","Serhou Guirassy","Deniz Undav"],
  "SV Werder Bremen":       ["Michael Zetterer","Mitchell Weiser","Niklas Stark","Amos Pieper","Anthony Jung","Milos Veljkovic","Christian Groß","Marco Friedl","Niklas Schmidt","Romano Schmid","Marvin Ducksch"],
  "SC Freiburg":            ["Mark Flekken","Lukas Kübler","Philipp Lienhart","Manuel Gulde","Christian Günter","Nicolas Höfler","Maximilian Eggestein","Ritsu Dōan","Roland Sallai","Michael Gregoritsch","Vincenzo Grifo"],
  "TSG Hoffenheim":         ["Oliver Baumann","Kevin Vogt","Stanley Nsoki","Ozan Kabak","David Jurásek","Tom Bischoff","Dennis Geiger","Pavel Kadeřábek","Jacob Bruun Larsen","Andrej Kramaric","Christoph Baumgartner"],
  "Borussia M'gladbach":    ["Jonas Omlin","Stefan Lainer","Nico Elvedi","Marvin Friedrich","Ramy Bensebaini","Christoph Kramer","Florian Neuhaus","Manu Koné","Robin Hack","Franck Honorat","Lars Stindl"],
  "FC Augsburg":            ["Finn Dahmen","Mads Pedersen","Jeffrey Gouweleeuw","Felix Uduokhai","Robert Gumny","Carlos Gruezo","Niklas Dorsch","Fredrik Jensen","Daniel Caligiuri","Ruben Vargas","Ermedin Demirović"],
  "VfL Wolfsburg":          ["Koen Casteels","Micky van de Ven","Maxence Lacroix","Sebastiaan Bornauw","Paulo Otávio","Maximilian Arnold","Mattias Svanberg","Lukas Nmecha","Kevin Behrens","Jonas Wind","Wout Weghorst"],
  "1. FC Köln":             ["Marvin Schwäbe","Jonas Hector","Luca Kilian","Jeff Chabot","Mergim Berisha","Dejan Ljubičić","Ellyes Skhiri","Eric Martel","Florian Kainz","Ondrej Duda","Davie Selke"],
  "1. FSV Mainz 05":        ["Robin Zentner","Stefan Bell","Andreas Hanche-Olsen","Alexander Hack","Angelino","Silvan Widmer","Leandro Barreiro","Dominik Kohr","Karim Onisiwo","Jonathan Burkardt","Marcus Ingvartsen"],
  "Union Berlin":           ["Frederik Rönnow","Josip Juranovic","Danilho Doekhi","Diogo Leite","Paul Jaeckel","András Schäfer","Rani Khedira","Levin Öztunali","Sheraldo Becker","Kevin Behrens","Jordan Siebatcheu"],
  "VfL Bochum":             ["Manuel Riemann","Cristian Gamboa","Ivan Ordets","Keven Schlotterbeck","Danilo Soares","Anthony Losilla","Patrick Osterhage","Kevin Stöger","Christopher Antwi-Adjej","Philipp Hofmann","Takuma Asano"],
  "1. FC Heidenheim":       ["Kevin Müller","Patrick Mainka","Jan Schöppner","Lennard Maloney","Jonas Föhrenbach","Denis Thomalla","Marvin Pieringer","Robert Leipertz","Paul Wanner","Maximilian Breunig","Tim Kleindienst"],
  "SV Darmstadt 98":        ["Marcel Schuhen","Patric Pfeiffer","Fabian Holland","Thomas Isherwood","Clemens Riedel","Fabian Schnellhardt","Mathias Honsak","Klaus Gjasula","Oscar Vilhelmsson","Tobias Kempe","Braydon Manu"],
  // ── SERIE A ──
  "Juventus FC":            ["Wojciech Szczęsny","Andrea Cambiaso","Gleison Bremer","Federico Gatti","Alex Sandro","Nicolò Fagioli","Adrien Rabiot","Weston McKennie","Federico Chiesa","Filip Kostić","Dušan Vlahović"],
  "AC Milan":               ["Mike Maignan","Davide Calabria","Fikayo Tomori","Malick Thiaw","Theo Hernández","Ruben Loftus-Cheek","Tijjani Reijnders","Yunus Musah","Christian Pulisic","Rafael Leão","Olivier Giroud"],
  "Inter Milan":            ["Yann Sommer","Denzel Dumfries","Francesco Acerbi","Alessandro Bastoni","Federico Dimarco","Nicolò Barella","Hakan Çalhanoğlu","Henrikh Mkhitaryan","Matteo Darmian","Marcus Thuram","Lautaro Martínez"],
  "AS Roma":                ["Rui Patrício","Rick Karsdorp","Gianluca Mancini","Chris Smalling","Angeliño","Leandro Paredes","Lorenzo Pellegrini","Paulo Dybala","Stephan El Shaarawy","Tammy Abraham","Romelu Lukaku"],
  "SSC Napoli":             ["Alex Meret","Giovanni Di Lorenzo","Amir Rrahmani","Mathías Olivera","Piotr Zielinski","Stanislav Lobotka","Eljif Elmas","Khvicha Kvaratskhelia","Hirving Lozano","Victor Osimhen","Giacomo Raspadori"],
  "Atalanta BC":            ["Juan Musso","Rafael Tolói","Isak Hien","Giorgio Scalvini","Joakim Mæhle","Marten de Roon","Ederson","Teun Koopmeiners","Aleksei Miranchuk","Charles De Ketelaere","Gianluca Scamacca"],
  "ACF Fiorentina":         ["Pietro Terracciano","Dodo","Nikola Milenković","Lucas Quarta","Cristiano Biraghi","Rolando Mandragora","Arthur","Gaetano Castrovilli","Nicolás González","Jonathan Ikoné","Luca Jović"],
  "SS Lazio":               ["Ivan Provedel","Manuel Lazzari","Mario Gila","Alessio Romagnoli","Mattia Zaccagni","Luis Alberto","Sergej Milinković-Savić","Felipe Anderson","Pedro","Ciro Immobile","Daichi Kamada"],
  "Torino FC":              ["Vanja Milinković-Savić","Perr Schuurs","Alessandro Buongiorno","Ricardo Rodríguez","Armando Izzo","Sasa Lukic","Ivan Ilić","Nikola Vlasic","Karol Linetty","Antonio Sanabria","Nemanja Radonjić"],
  "Bologna FC":             ["Lukasz Skorupski","Adama Soumaoro","Jhon Lucumi","Kevin Bonifazi","Luca Pellegrini","Gary Medel","Lewis Ferguson","Riccardo Orsolini","Nicola Sansone","Marko Arnautovic","Joshua Zirkzee"],
  "Genoa CFC":              ["Josep Martínez","Radu Drăguşin","Johan Vásquez","Stefano Sturaro","Matías Viña","Morten Thorsby","Jakub Jankto","Filippo Melegoni","Albert Guðmundsson","Caleb Ekuban","Gianluca Retegui"],
  "Monza":                  ["Di Gregorio","Pablo Marí","Marko Brescianini","Andrea Ranocchia","Carlos Augusto","Luca Caldirola","Patrick Ciurria","Matteo Pessina","Andrea Colpani","Dany Mota","Gianluca Caprari"],
  "Udinese Calcio":         ["Marco Silvestri","Rodrigo Becão","Nehuen Perez","Destiny Udogie","Kingsley Ehizibue","Tolgay Arslan","Roberto Pereyra","Lazar Samardžić","Sandi Lovrić","Beto","Gerard Deulofeu"],
  "Hellas Verona":          ["Lorenzo Montipò","Federico Ceccherini","Koray Günter","Giangiacomo Magnani","Fabio Lazovic","Adrien Tamèze","Darko Lazovic","Antonin Barak","Kevin Lasagna","Giovanni Simeone","Nicolo Casale"],
  "US Lecce":               ["Wladimiro Falcone","Valentin Gendrey","Marin Pongračić","Kristoffer Askildsen","Piero Baschirotto","Joan González","Rémi Oudin","Antonino Gallo","Luca Strefezza","Lameck Banda","Nikola Krstović"],
  "Cagliari Calcio":        ["Simone Scuffet","Zito Luvumbo","Gianluca Lapadula","Yerry Mina","Raoul Bellanova","Nahitan Nández","Alberto Dossena","Gaetano Oristanio","Nicolò Viola","Aziz Ouédraogo","Paolo Azzi"],
  "Frosinone Calcio":       ["Turati","Lucioni","Bonifazi","Marchizza","Monterisi","Barrenechea","Gelli","Reinier","Marko Brescianini","Matías Soulé","Caso"],
  "Empoli FC":              ["Guglielmo Vicario","Tyronne Ebuehi","Ardian Ismajli","Koni De Winter","Fabiano Parisi","Razvan Marin","Nicolò Grassi","Tommaso Baldanzi","Sebastiano Esposito","Francesco Caputo","Emil Cerri"],
  "US Salernitana":         ["Luigi Sepe","Flavius Daniliuc","Norbert Gyömbér","Federico Bonazzoli","Emanuela Bradaric","Giulio Coulibaly","Christian Kastanos","Antonio Candreva","Lassana Coulibaly","Boulaye Dia","Pasquale Mazzocchi"],
  "US Sassuolo":            ["Andrea Consigli","Mert Müldür","Ruan Tressoldi","Martin Erlic","Rogério","Henrique","Nedim Bajrami","Kristian Thorstvedt","Domenico Berardi","Andrea Pinamonti","Grégoire Defrel"],
  // ── LIGUE 1 ──
  "Paris Saint-Germain":    ["Gianluigi Donnarumma","Achraf Hakimi","Marquinhos","Lucas Hernández","Nuno Mendes","Vitinha","Manuel Ugarte","Warren Zaïre-Emery","Bradley Barcola","Ousmane Dembélé","Randal Kolo Muani"],
  "Olympique de Marseille": ["Pau López","Jonathan Clauss","Samuel Gigot","Leonardo Balerdi","Nuno Tavares","Valentin Rongier","Jordan Veretout","Mattéo Guendouzi","Amine Harit","Alexis Sánchez","Pierre-Emerick Aubameyang"],
  "Olympique Lyonnais":     ["Lucas Perri","Malo Gusto","Castello Lukeba","Nicolas Tagliafico","Maxence Caqueret","Johann Lepenant","Corentin Tolisso","Romain Faivre","Tetê","Ernest Nuamah","Alexandre Lacazette"],
  "AS Monaco":              ["Philipp Köhn","Vanderson","Axel Disasi","Benoît Badiashile","Caio Henrique","Youssouf Fofana","Jean Lucas","Maghnes Akliouche","Krépin Diatta","Takumi Minamino","Wissam Ben Yedder"],
  "RC Lens":                ["Brice Samba","Jonathan Gradit","Kevin Danso","Facundo Medina","Jonathan Clauss","Salis Abdul Samed","Adrien Thomasson","Christopher Wooh","Wesley Saïd","Florian Sotoca","Lois Openda"],
  "Lille OSC":              ["Léo Jardim","Tiago Djaló","Gabriel Gudmundsson","Alexsandro","Ismaily","André","Benjamin André","Rémi Cabella","Jonathan Bamba","Edon Zhegrova","Jonathan David"],
  "Stade Rennais":          ["Steve Mandanda","Hamari Traoré","Arthur Theate","Adrien Truffert","Warrick Samaké","Baptiste Santamaria","Lovro Majer","Martin Terrier","Désiré Doué","Amine Gouiri","Arnaud Kalimuendo"],
  "Stade Brestois 29":      ["Marco Bizot","Pierre Lala","Brendan Chardonnet","Christophe Herelle","Romain Perraud","Mahdi Camara","Romain Faivre","Del Castillo","Jean-Kévin Duverne","Steve Mounié","Franck Honorat"],
  "OGC Nice":               ["Kasper Schmeichel","Jean-Clair Todibo","Youcef Atal","Melvin Bard","Jordan Lotomba","Khéphren Thuram","Hicham Boudaoui","Ross Barkley","Terem Moffi","Andy Delort","Nicolas Pépé"],
  "Toulouse FC":            ["Maxime Dupé","Gabriel Suazo","Rasmus Nicolaisen","Vincent Sierro","Anthony Rouault","Stijn Spierings","Van den Boomen","Fares Chaïbi","Thijs Dallinga","Shavy Babicka","Logan Costa"],
  "FC Nantes":              ["Alban Lafont","Dennis Appiah","Jean-Charles Castelletto","Nicolas Pallois","Pedro Chirivella","Florent Mollet","Moses Simon","Quentin Merlin","Mostafa Mohamed","Faris Moumbagna","Nathan Zeze"],
  "RC Strasbourg":          ["Matz Sels","Alexander Djiku","Lamine Diallo","Maxime Le Marchand","Frédéric Guilbert","Nordine Kandil","Adrien Thomasson","Lucas Perrin","Habib Diallo","Lebo Mothiba","Kevin Gameiro"],
  "Stade de Reims":         ["Yehvann Diouf","Thomas Foket","Emmanuel Agbadou","Wout Faes","Emmanuel Locko","Marshall Munetsi","Azor Matusiwa","Folarin Balogun","Junya Ito","Alexis Flips","Thibault De Smet"],
  "Montpellier HSC":        ["Jonas Omlin","Hilton","Nicolas Gioacchini","Joris Chotard","Valère Germain","Téji Savanier","Elye Wahi","Wahbi Khazri","Maïssa Doumbouya","Léo Leroy","Stephy Mavididi"],
  "Le Havre AC":            ["Arthur Desmas","Emmanuel Latte Lath","Arouna Sangante","Gautier Lloris","Yassine Kechta","Alexandre Mendy","Abdoulaye Touré","Pierre Lees-Melou","Josué Casimir","Daler Kuzyaev","Jamal Mothiba"],
  "FC Metz":                ["Marc-Aurèle Caillard","Matthieu Udol","Matthieu Dossevi","Digbo Habran","Lamine Gueye","Iké Ugbo","Fabien Centonze","Cheick Doumbia","Georges Mikautadze","Thomas Delaine","Lamine Camara"],
  "Clermont Foot":          ["Arthur Desmas","Johan Gastien","Muhammed Cham Tchaouna","Salis Abdul Samed","Jim Allevinah","Bayo Cheikh","Dango Ouattara","Mory Diaw","Mohamed Bayo","Lesley Ugochukwu","Lys Mousset"],
  "FC Lorient":             ["Vito Mannone","Julien Laporte","Denis Hamel","Fabien Lemoine","Quentin Boisgard","Armand Laurienté","Enzo Le Fée","Théo Le Bris","Ibrahima Koïta","Dango Ouattara","Terem Moffi"],
  // ── UEFA CHAMPIONS LEAGUE TEAMS ──
  "FK Red Star Belgrade":   ["Milan Borjan","Strahinja Pavlović","Milan Gajić","Aleksandar Dragović","Guélor Kanga","Mirko Ivanić","Marko Lazetić","Osman Bukari","El Fardou Ben Nabouhane","Aleksandar Katai","Luka Jović"],
  "Benfica":                ["Odysseas Vlachodimos","Álvaro Carreras","António Silva","Nicolás Otamendi","Alejandro Grimaldo","Fredrik Aursnes","João Mário","Rafa","João Félix","Gonçalo Ramos","David Neres"],
  "FC Porto":               ["Diogo Costa","João Mário","Pepe","David Carmo","Zaidu Sanussi","Pepê","Uribe","Galeno","Mehdi Taremi","Evanilson","Danny Namaso"],
  "Sporting CP":            ["Adán","Ricardo Esgaio","Gonçalo Inácio","Luís Neto","Matheus Reis","Hidemasa Morita","Morten Hjulmand","Pedro Porro","Paulinho","Trincão","Víktor Gyökeres"],
  "Club Brugge":            ["Simon Mignolet","Dedryck Boyata","Clinton Mata","Brandon Mechele","Bjorn Meijer","Casper Nielsen","Andreas Skov Olsen","Ferran Jutglà","Raphael Onyedika","Tajon Buchanan","Noa Lang"],
  "Galatasaray":            ["Muslera","Sacha Boey","Victor Nelsson","Davinson Sánchez","Berkan Kutlu","Sérgio Oliveira","Kerem Aktürkoğlu","Mauro Icardi","Dries Mertens","Wilfried Zaha","Lucas Torreira"],
  "Fenerbahçe":             ["Altay Bayındır","Ferdi Kadıoğlu","Jayden Oosterwolde","Kim Min-Jae","Luiz Gustavo","Sebastian Szymanski","İrfan Can Kahveci","Enner Valencia","Michy Batshuayi","Edin Džeko","Dušan Tadić"],
  "Celtic FC":              ["Joe Hart","Anthony Ralston","Cameron Carter-Vickers","Carl Starfelt","Greg Taylor","Callum McGregor","Matt O'Riley","Reo Hatate","James Forrest","Kyogo Furuhashi","Daizen Maeda"],
  "Rangers FC":             ["Allan McGregor","James Tavernier","Connor Goldson","Ben Davies","Ridvan Yilmaz","John Lundstram","Glen Kamara","Scott Arfield","Ryan Kent","Malik Tillman","Alfredo Morelos"],
  "Ajax":                   ["Remko Pasveer","Devyne Rensch","Jurien Timber","Daley Blind","Owen Wijndal","Edson Álvarez","Steven Berghuis","Mohamed Kudus","Kenneth Taylor","Dušan Tadić","Brian Brobbey"],
  "PSV Eindhoven":          ["Walter Benitez","Jordan Teze","André Ramalho","Patrick van Aanholt","Denzel Dumfries","Ibrahim Sangaré","Joey Veerman","Phillipp Mwene","Cody Gakpo","Luuk de Jong","Xavi Simons"],
  "Feyenoord":              ["Justin Bijlow","Marcus Pedersen","Gernot Trauner","Quilindschy Hartman","Lutsharel Geertruida","Mats Wieffer","Orkun Kökçü","Calvin Stengs","Alireza Jahanbakhsh","Santiago Giménez","Cyriel Dessers"],
  "Dynamo Kyiv":            ["Georgiy Bushchan","Oleksandr Karavayev","Ilya Zabarnyi","Oleksandr Syrota","Vitaliy Mykolenko","Serhiy Sydorchuk","Mykhailo Mudryk","Viktor Tsygankov","Vladyslav Supryaha","Benjamin Verbič","Denys Garmash"],
  "Shakhtar Donetsk":       ["Anatoliy Trubin","Yukhym Konoplya","Mykola Matviyenko","Serhiy Kryvtsov","Dmytro Mykhaylenko","Taras Stepanenko","Georgiy Sudakov","Marlon","Mykhailo Mudryk","Lassina Traoré","Danylo Sikan"],
  "Olympiacos":             ["José Sá","Rúben Semedo","Ousseynou Ba","Pape Abou Cissé","Kostas Fortounis","Sébastien Corchia","Andreas Bouchalakis","Mady Camara","Chiquinho","Mathieu Valbuena","Youssef El-Arabi"],
  "Panathinaikos":          ["Vasilios Barkas","Bart Schenkeveld","Tomas Holes","Thorsten Rinaldi","Willian Arão","Fotis Ioannidis","Faouzi Ghoulam","Abdul Mumin","Ionut Mitrita","Bart Ramselaar","Bernardo Espinosa"],
  // ── V.LEAGUE 1 ──
  "Hà Nội FC":              ["Nguyễn Văn Công","Bùi Tiến Dũng","Trần Đình Trọng","Đỗ Duy Mạnh","Nguyễn Thành Chung","Đỗ Hùng Dũng","Nguyễn Quang Hải","Nguyễn Văn Quyết","Thái Quý","Nguyễn Tiến Linh","Đoàn Văn Hậu"],
  "Hoàng Anh Gia Lai":      ["Nguyễn Văn Lâm","Nguyễn Văn Thanh","Nguyễn Hồng Duy","Vũ Tấn Sinh","Nguyễn Đức Lương","Lương Xuân Trường","Nguyễn Công Phượng","Trần Minh Vương","Nguyễn Văn Tùng","Đinh Bảo","Rion Yamahata"],
  "SHB Đà Nẵng":            ["Phạm Tuấn Mạnh","Nguyễn Xuân Mạnh","Phùng Hải Thuỳ","Trần Minh Hiếu","Phạm Quý Hạnh","Nguyễn Quang Phúc","Phan Thanh Hiền","Nguyễn Thành Luân","Trần Ngọc Sơn","Phạm Trọng Hùng","Nguyễn Việt Cường"],
  "Viettel FC":             ["Phí Minh Long","Bùi Hoàng Việt Anh","Ngô Tùng Quốc","Trần Đình Trọng","Hoàng Đức","Nguyễn Hai Long","Nguyễn Trọng Hoàng","Từ Hiển Đạt","Nguyễn Tiến Linh","Bùi Vĩ Hào","Nguyễn Hải Long"],
  "TP.HCM FC":              ["Bùi Tấn Trường","Đinh Thanh Trung","Ngô Hoàng Thịnh","Lê Phước Tứ","Hà Minh Tuấn","Phạm Ngọc Thạch","Nguyễn Phong Hồng Duy","Nguyễn Văn Toàn","Phan Thanh Hậu","Nguyễn Trọng Hùng","Đinh Hoàng La"],
  "Becamex Bình Dương":     ["Nguyễn Mạnh Dũng","Huỳnh Tấn Tài","Đinh Thanh Bình","Trần Bảo Toàn","Lương Xuân Trường","Đinh Hoàng Max","Nguyễn Văn Sơn","Trịnh Duy Hiệp","Phùng Thanh Phương","Lê Tấn Tài","Tô Văn Vũ"],
  "Nam Định FC":            ["Nguyễn Văn Hào","Dương Văn Hào","Huỳnh Quốc Anh","Lê Xuân Tú","Nguyễn Tiến Thành","Nguyễn Trọng Hoàng","Trần Thanh Sơn","Đinh Hoàng La","Vũ Minh Tuấn","Trần Phi Sơn","Nguyễn Quang Tình"],
  "Hải Phòng FC":           ["Phạm Văn Thuận","Phạm Xuân Mạnh","Bùi Tiến Dũng","Ngô Tùng Quốc","Đỗ Duy Mạnh","Nguyễn Tuấn Anh","Nguyễn Hải Long","Phạm Đức Huy","Văn Toàn","Phan Văn Đức","Nguyễn Công Phượng"],
  "Topenland Bình Định":    ["Nguyễn Tuấn Mạnh","Lê Phước Tứ","Đinh Hoàng","Nguyễn Xuân Mạnh","Trần Văn Toàn","Nguyễn Tiến Dũng","Phạm Hồng Duy","Trần Bảo Toàn","Nguyễn Phi Sơn","Lê Quang Tình","Huỳnh Tuấn Tài"],
  "Quảng Nam FC":           ["Bùi Văn Đô","Nguyễn Xuân Nam","Trần Đình Khánh","Lê Văn Thắng","Nguyễn Hoàng Anh","Phan Văn Đức","Lê Phát Lộc","Trần Minh Hiếu","Dương Văn Hào","Nguyễn Tuấn Thành","Lê Quang Hùng"],
  "Thanh Hóa FC":           ["Lê Văn Thắng","Nguyễn Trọng Hoàng","Phạm Ngọc Thạch","Nguyễn Văn Toàn","Trần Phi Sơn","Đinh Hoàng La","Nguyễn Tiến Linh","Bùi Vĩ Hào","Đỗ Duy Mạnh","Hoàng Đức","Nguyễn Tuấn Anh"],
  "Sông Lam Nghệ An":       ["Nguyễn Bá Tiếp","Lê Đình Long Vũ","Nguyễn Trọng Đại","Hà Đức Chinh","Trần Tú","Trần Đình Đồng","Phan Văn Đức","Nguyễn Ngọc Thắng","Phạm Văn Sơn","Ngô Hoàng Thịnh","Nguyễn Văn Hào"],
  "Long An FC":             ["Trần Bảo Toàn","Nguyễn Hải Nam","Lê Văn Sơn","Phạm Tiến Anh","Phạm Đức Huy","Đinh Hoàng Max","Trần Minh Tuấn","Lê Thanh Bình","Phan Văn Phú","Nguyễn Trọng Đức","Phùng Quang Thành"],
  "Khánh Hòa FC":           ["Đặng Văn Lâm","Phạm Ngọc Thạch","Nguyễn Tiến Thành","Trần Phi Sơn","Lê Văn Thắng","Nguyễn Trọng Hoàng","Đinh Hoàng La","Bùi Vĩ Hào","Nguyễn Tiến Linh","Hoàng Đức","Trần Thanh Sơn"],
  // ── J1 LEAGUE ──
  "Gamba Osaka":            ["Higashiguchi Masaaki","Muroya Sei","Kim Young-gwon","Shiotani Tomoya","Fujio Teruki","Yajima Shu","Patric","Kurata Shu","Usami Takashi","Leandro Silva","Doan Ritsu"],
  "Kawasaki Frontale":      ["Seungung Jung","Jesiel","Taniguchi Shogo","Asada Koki","Nagaya Kengo","Maruyama Yasuto","Akihiro Ienaga","Yamane Miki","Léo Ceará","Reo Hatate","Morishima Tsukasa"],
  "Urawa Red Diamonds":     ["Nishikawa Shusaku","Sakai Hiroki","Makino Tomoaki","Atsuto Uchida","Ogawa Takaaki","Anderson Lopes","Ohshima Ryota","Yuki Muto","Linssen Alex","Kai Ahagon","Hirokazu Ishihara"],
  "Yokohama F.Marinos":     ["Ángel Rodado","Thiago Martins","Takushi Masahiro","Eduardo","Wataru Endo","Takuma Nishimura","Daizen Maeda","Marcos Júnior","Malaury Martin","Elber","Kosei Tani"],
  "Nagoya Grampus":         ["Mitch Langerak","Yūichi Maruyama","Kazuki Ōyama","Keiya Sento","Ryuji Izumi","Mateus","Shū Kurata","Ryōya Ogawa","Jakub Świerczok","Yuki Kakita","Naoki Maeda"],
  "Sanfrecce Hiroshima":    ["Hayashi Daisuke","Taisei Miyashiro","Sato Shunsuke","Kiyohara Shuto","Nakamura Kai","Aoyama Kota","Nishi Ryoma","Tetteh Ambrose","Zehi Jungwoo","Gakuto Notsuda","Ryotaro Meshino"],
  "Cerezo Osaka":           ["Kinoshita Junichi","Hiroshi Kiyotake","Hiroaki Okuno","Junya Ito","Rika Momiki","Souza","Tiago Pagnussat","Kosei Shibasaki","Mizuki Hamada","Taggart Adam","Naoyuki Fujita"],
  "Vissel Kobe":            ["Daiya Maekawa","Riku Handa","Sergi Samper","Hotaru Yamaguchi","Thomas Vermaelen","Yoshinori Muto","Yuya Osako","Seko Fofana","Kara Mbodj","Jefferson","Andrés Iniesta"],
  "Kashima Antlers":        ["Hitoshi Sogahata","Tomoya Inukai","Masaaki Higashiguchi","Koki Machida","Léo Silva","Yuta Higuchi","Juan Alano","Artur","Machida Koki","Ryotaro Ito","Kim Min-Tae"],
  "FC Tokyo":               ["Akira Nishihara","Tsuyoshi Watanabe","Leandro","Diego Oliveira","Yōhei Nishibe","Jeferson Nascimento","Kuryu Matsuki","Adailton","Yasuto Wakizaka","Forest Kimoto","Makoto Okazaki"],
  "Kashiwa Reysol":         ["Sho Naruoka","Genta Miura","Michael Mba","Ryuta Oshima","Yuya Fujita","Tomás Esteves","Kento Nagasaki","Futa Yamamoto","Yuta Kishimoto","Ataru Esaka","Kunimitsu Sekiguchi"],
  "Shonan Bellmare":        ["Kosei Tani","Taishi Taguchi","Tomoya Inukai","Shuto Abe","Takuya Ogiwara","Taiga Hata","Kodai Sano","Daiki Sugioka","Ryoto Lopes","Taichi Hara","Daichi Kamada"],
  "Avispa Fukuoka":         ["Junichi Kinoshita","Kazuki Mato","Hiroshi Kiyotake","Takahiro Kunimoto","Sota Hirano","Tatsuya Tanaka","Naomichi Ueda","Kyosuke Tagawa","Wellington Silva","Yoshiki Ogawa","Koki Saito"],
  "Consadole Sapporo":      ["Takuto Hayashi","Anderson Lopes","Taiki Sato","Yujiro Sugita","Hiroyuki Abe","Kunta Kimura","Shunta Nakamura","Yosuke Kashiwagi","Keisuke Honda","Tsukasa Morishima","Deep Chokkalingam"],
  "Albirex Niigata":        ["Tatsuya Ito","Yuichiro Nagai","Hitoshi Shiota","Kento Hashimoto","Soma Takuma","Daiki Sato","Keiya Sento","Kensuke Nagai","Kota Watanabe","Hayashi Nobuyuki","Anthony Nwakaeme"],
  "Júbilo Iwata":           ["Kota Okubo","Yusuke Tasaka","Shota Kaneko","Kohki Yamashita","Daiki Sato","Takahiro Ogihara","Hiroaki Yokoyama","Daiki Sugioka","Yusuke Chajima","Yoshiki Sugita","Hiroshi Kyotake"],
  "Shimizu S-Pulse":        ["Naoki Maeda","Yūya Fujita","Shion Inoue","Takaaki Shichi","Koh Itakura","Yuta Hatanaka","Yuki Sonoda","Tsukasa Inoue","Kento Misao","Shinichi Okamoto","Takuya Kida"],
  "Tokushima Vortis":       ["Tsukasa Shiotani","Masaki Fukai","Tomoya Sakuma","Ryuki Nojiri","Seiya Fujita","Takuma Nishimura","Masaya Okugawa","Tomoya Inukai","Seiya Maikuma","Takuya Hirose","Daiki Sato"],
  // ── K LEAGUE 1 ──
  "Jeonbuk Hyundai Motors": ["Song Beom-keun","Kim Moon-hwan","Hong Jeong-ho","Jeong Woon","Kim Jin-su","Lee Kang-in","An Byong-jun","Cho Gue-sung","Stanislav Iljutčenko","Guélor Kanga","Gustavo"],
  "Ulsan Hyundai":          ["Jo Hyeon-woo","Kim Min-jun","Kim Tae-hwan","Lee Myeong-jae","Kim Gi-hee","Lee Chung-yong","Kim Min-woo","Won Du-jae","Ko Seung-beom","Gökan Töre","Um Won-sang"],
  "FC Seoul":               ["Yang Han-bin","Hwang Hyeon-su","Lee Sang-min","Kim Nam-chun","Ji Dong-won","Ki Sung-yueng","Lee Chun-soo","Choi Hyun-taik","Pato","Dejan Damjanović","Cristiano"],
  "Suwon Samsung Bluewings":["Yang Hyung-mo","Goh Ki-han","Yoon Bit-garam","Byun Sang-yoon","Kim Jong-woo","Lee Jong-sung","Lee Sang-ho","Yeom Ki-hun","Park Jun-tae","Choi Sung-keun","Adam Taggart"],
  "Pohang Steelers":        ["Shin Hwa-yong","Choi Cheol-soon","Lee Dong-jun","Shin Kwang-hoon","Jung Jae-yong","Lee Seung-mo","Ahn Jung-hwan","Oh Se-hun","Jeon Joon","Na Sang-ho","Alexsandro"],
  "Daegu FC":               ["Jeong Tae-wook","Lee Yong-rae","Hong Jeong-ho","Kim Mi-hyeon","Kwon Sun-hyung","Mauricio","Cesinha","Magno","Keijiro Ogawa","Edgar","Jo Hyeon-woo"],
  "Jeju United":            ["Kim Ho-jun","Ahn Hyun-beom","Kim Oston","Lee Kwang-hyun","Lee Chang-min","Jang Seong-won","Kim Il-sung","Cho Sung-joon","Oh Ban-seok","Oh Hyun-gyu","Ki Sung-yueng"],
  "Incheon United":         ["Park Jun-hyeok","Ha Seong-min","Kim Sung-gook","Lee Myeong-jae","Seo Bo-min","Jung Seung-hyun","Diego","Kevin Boli","Cho Sung-hwan","Lee Jae-sung","Park Dong-jin"],
  "Gangwon FC":             ["Park Ji-soo","Lee Jae-won","Ju Hyun-woo","Kim Oston","Ko Seung-beom","Ryu Seung-woo","Lee Sang-min","Kim Hyo-gi","Hwang Il-su","Llorente","Ben Halloran"],
  "Gyeongnam FC":           ["Lee Bum-young","Song Ju-hun","Yun Bit-garam","Kim Hyun-sung","Oh Jae-seok","Seo Bo-min","Kim Ho-jun","Piovaccari","Andrija Kaluđerović","Lionel Carole","Ko Kyo-won"],
  "Daejeon Citizen":        ["Kim Dal-soo","Oh Seung-hoon","Lee Jae-won","Lee Yong-rae","Hong Jeong-ho","Park Sang-hyuk","Kim Jun-beom","Jang Jae-won","Henriquez","Carlos Mendes","Elton"],
  "Seongnam FC":            ["Park Il-gyu","Oh Beom-seok","Go Gu-seong","Chang Hyun-soo","Jang Hyun-soo","Lee Chan-dong","Yun Bit-garam","Song Joo-hun","Lee Seok","Oh Se-hun","Dejan Damjanović"],
  // ── MLS ──
  "Inter Miami CF":         ["Drake Callender","DeAndre Yedlin","Tomás Avilés","Sergio Busquets","Jordi Alba","Alejandro Pozuelo","Benjamin Cremaschi","Robert Taylor","Lionel Messi","Josef Martínez","Leonardo Campana"],
  "LA Galaxy":              ["John McCarthy","Julian Araujo","Derrick Williams","Eriq Zavaleta","Raheem Edwards","Douglas Costa","Mark Delgado","Riqui Puig","Samuel Grandsir","Kevin Cabral","Chicharito Hernández"],
  "LAFC":                   ["Maxime Crépeau","Diego Palacios","Eddie Segura","Jesus Murillo","Ryan Hollingshead","José Cifuentes","Kellyn Acosta","Denis Bouanga","Carlos Vela","Giorgio Chiellini","Gareth Bale"],
  "Seattle Sounders FC":    ["Stefan Frei","Brad Smith","Yeimar Gómez","Kelyn Rowe","Alex Roldan","Obed Vargas","Cristian Roldan","Jordan Morris","Raúl Ruidíaz","Fredy Montero","João Paulo"],
  "Portland Timbers":       ["David Bingham","Larrys Mabiala","Bill Tuiloma","Zac McGraw","Evander","Diego Chará","Sebastian Blanco","Yimmi Chará","Dairon Asprilla","Felipe Mora","Claudio Bravo"],
  "Atlanta United":         ["Brad Guzan","Brooks Lennon","Miles Robinson","Andrew Gutman","Caleb Wiley","Santiago Sosa","Thiago Almada","Marcelino Moreno","Giorgos Giakoumakis","Xande Silva","Ronaldo Cisneros"],
  "New York City FC":       ["Sean Johnson","Anton Tinnerholm","Maxime Chanot","Thiago Martins","Ethan Wuycinick","Maxi Moralez","Alfredo Morales","Valentin Castellanos","Talles Magno","Gabriel Pereira","Jesús Medina"],
  "New England Revolution": ["Djordje Petrović","Brandon Bye","Andrew Farrell","Henry Kessler","DeJuan Jones","Carles Gil","Matt Polster","Maciel","Gustavo Bou","Arnór Sigurdsson","Adam Buksa"],
  "Orlando City SC":        ["Pedro Gallese","Kyle Smith","Robin Jansson","Antonio Carlos","Joao Moutinho","César Araujo","Júnior Urso","Ercan Kara","Facundo Torres","Benji Michel","Alexandre Pato"],
  "Colorado Rapids":        ["William Yarbrough","Sam Vines","Danny Wilson","Lalas Abubakar","Michael Tah","Cole Bassett","Jack Price","Mark Anthony Kaye","Diego Rubio","Michael Barrios","André Shinyashiki"],
  "Chicago Fire FC":        ["Gabriel Slonina","Mauricio Pineda","Rafael Czichos","Carlos Terán","Miguel Navarro","Gastón Giménez","Federico Navarro","Przemysław Frankowski","Xherdan Shaqiri","Alan Pulido","Kacper Przybylko"],
  "FC Dallas":              ["Jimmy Maurer","Matt Hedges","José Martínez","Ryan Hollingshead","Justin Che","Facundo Quignon","Pablo Aranguiz","Dante Sealy","Jesús Ferreira","Jáder Obrian","Ricardo Pepi"],
  "Houston Dynamo":         ["Steve Clark","Tim Parker","Teenage Hadebe","Griffin Dorsey","Ethan Bartlow","Hector Herrera","Adalberto Carrasquilla","Darwin Cerén","Memo Rodriguez","Fafà Picault","Sebastian Ferreira"],
  "Real Salt Lake":         ["Zac MacMath","Justen Glad","Donny Toia","Marcelo Silva","Aaron Herrera","Pablo Ruiz","Damir Kreilach","Albert Rusnák","Jefferson Savarino","Bobby Wood","Rubio Rubín"],
  "Minnesota United":       ["Dayne St. Clair","Romain Métanire","Bakaye Dibassy","Brent Kallman","Chase Gasper","Emanuel Reynoso","Robin Lod","Hassani Dotson","Abu Danladi","Adrien Hunou","Ethan Finlay"],
  // ── BRASILEIRÃO ──
  "CR Flamengo":            ["Santos","Fabrício Bruno","David Luiz","Léo Pereira","Filipe Luís","Everton Ribeiro","João Gomes","Giorgian De Arrascaeta","Éverton Cebolinha","Gabigol","Pedro"],
  "São Paulo FC":           ["Felipe Alves","Igor Vinicius","Arboleda","Ferraresi","Welington","Rodrigo Nestor","Pablo Maia","Alisson","Erison","Jonathan Calleri","Wellington Rato"],
  "SE Palmeiras":           ["Weverton","Marcos Rocha","Gustavo Gómez","Murilo","Piquerez","Danilo","Raphael Veiga","Rony","Dudu","Endrick","Flaco López"],
  "SC Corinthians":         ["Cássio","Rafael Ramos","Gil","Lucas Veríssimo","Fábio Santos","Maycon","Renato Augusto","Giuliano","Róger Guedes","Yuri Alberto","Gustavo Mantuan"],
  "Grêmio FBPA":            ["Brenno","Rodrigo Caio","Geromel","Kannemann","Nicolas","Villasanti","Lucas Silva","Reinaldo","Campaz","Ferreirinha","Diego Souza"],
  "Sport Club Internacional":["Daniel","Bustos","Vitão","Mercado","Renê","Edenilson","Mauricio","Liziero","Wanderson","Alan Patrick","Alemão"],
  "CA Paranaense":          ["Santos","Khellven","Thiago Heleno","Gamarra","Nicolas","Fernandinho","Erick","Alex Guimarães","Vitor Bueno","Canobbio","Vitor Roque"],
  "Atlético Mineiro":       ["Éverson","Guga","Igor Rabello","Guilherme Arana","Réver","Jair","Nacho Fernández","Zaracho","Hyoran","Eduardo Sasha","Hulk"],
  "Fluminense FC":          ["Fábio","Samuel Xavier","Nino","David Braz","Cano Germán","Lima","André","Ganso","Arias","Jhon","Marcelo"],
  "Santos FC":              ["João Paulo","Dodô","Maicon","Eduardo Bauermann","Felipe Jonatan","Camacho","Rodrigo Fernández","Marcos Leonardo","Ângelo","Soteldo","Lucas Braga"],
  "Botafogo de FR":         ["Gatito Fernández","DG","Philipe Sampaio","Kanu","Victor Cuesta","Tchê Tchê","Del Castillo","Gustavo Sauer","Tiquinho Soares","Jeffinho","Eduardo"],
  "Cruzeiro EC":            ["Rafael Cabral","William","Luciano Castán","Lucas Oliveira","Matheus Henrique","Ramiro","Neto Moura","Vitor Roque","Edu","Luvannor","Nikão"],
  "Vasco da Gama":          ["Léo Jardim","Léo Matos","Leandro Castán","Robson Bambu","Edimar","Yuri Lara","Nenê","Andrey Santos","Erick","Gabriel Pec","Vegetti"],
  "Bahia":                  ["Marcos Felipe","Gilberto","Kanu","Luiz Otávio","Luiz Henrique","Patrick de Lucca","Cauly","Daniel","Thaciano","Everaldo","Biel"],
  "Fortaleza EC":           ["Fernando Miguel","Tinga","Titi","Breno Lopes","Bruno Melo","Lucas Crispim","Hércules","Zé Welison","Depietri","Moisés","Romero"],
  "América FC":             ["Matheus Cavichioli","Diego","Eder","Ricardo Silva","Marlon","Benítez","Juninho","Matheusinho","Pedrinho","Henrique Almeida","Everaldo"],
  // ── SAUDI PRO LEAGUE ──
  "Al Hilal SFC":           ["Yassine Bounou","Saud Abdulhamid","Kalidou Koulibaly","Ali Al-Bulaihi","João Cancelo","Ruben Neves","Sergej Milinković-Savić","Sandro Tonali","Michael Estrada","Aleksandar Mitrović","Neymar Jr"],
  "Al Nassr FC":            ["Bento","Salmeen Al-Motairi","Aymeric Laporte","Marcelo Brozović","Ali Lajami","Sami Al-Najei","Luiz Gustavo","Sadio Mané","Abdulrahman Ghareeb","Anderson Talisca","Cristiano Ronaldo"],
  "Al Ittihad Club":        ["Marcelo Grohe","Siyabonga Ngezana","Fabinho","N'Golo Kanté","Romarinho","Karim Benzema","Riyad Mahrez","Roberto Firmino","Luiz Felipe","Naif Aguerd","Jota"],
  "Al Ahli Saudi FC":       ["Edouard Mendy","Roger Ibañez","Merih Demiral","Bruno","Gabri Veiga","Franck Kessié","Allan Saint-Maximin","Ivan Toney","Ryan Babel","Roberto Firmino","Riyad Mahrez"],
  "Al Shabab FC":           ["Mohammed Al-Owais","Mohammed Al-Breik","Hamdan Al-Shamrani","Salem Al-Dawsari","Mohammed Kanno","Sami Al-Khaibari","Ali Al-Hassan","Nayef Al-Johar","Waleed Al-Ahmed","Fahad Al-Muwallad","Naif Aguerd"],
  "Al Qadsiah":             ["Abdulrahman Al-Muqahwi","Yasser Al-Qahtani","Majdi Siddiq","Raed Al-Yahya","Abdullah Al-Shubaili","Saud Al-Mufarrij","Turki Al-Ammar","Saad Al-Harthi","Mohammed Karimi","Talles Magno","Romarinho"],
  "Al Faysaly":             ["Ziad Al-Sahafi","Hamdan Al-Anbar","Saad Al-Harbi","Tariq Al-Shalhoob","Ahmed Madouh","Khaled Al-Ghannam","Firas Al-Buraikan","Saud Al-Muwallad","Mohammed Al-Fatil","Naif Hazazi","Islam Slimani"],
  "Damac FC":               ["Yasser Al-Mosailem","Khalil Al-Ghamdi","Mohammed Al-Rabia","Saeed Al-Owairan","Abdullah Al-Zobair","Hussain Al-Moqahwi","Bandar Al-Ghamdi","Ibrahim Al-Ghamdi","Saud Al-Mufarrij","Raúl Jiménez","Strandberg"],
  "Al Fateh":               ["Jamal Al-Shammari","Ahmed Al-Anazi","Mohammed Al-Shalhoub","Bandar Al-Mubarak","Nassir Al-Dawsari","Saud Al-Muwallad","Mohammed Al-Buraikan","Haroune Camara","Ousama Tannane","Sébastien Haller","Yacine Brahimi"],
  "Al Hazem":               ["Abdullah Al-Rashidi","Fahad Al-Rashidi","Ziyad Al-Sahafi","Majed Hassan","Turki Al-Ammar","Fawaz Al-Rashidi","Abdullah Al-Shahrani","Mohammed Al-Fatil","Saad Al-Harbi","Musa Balde","Ahmad Benali"],
  "Al Taawoun FC":          ["Ziad Al-Sahafi","Abdullah Al-Zobaidi","Omar Al-Somah","Hasan Al-Haydos","Mohammed Al-Owais","Tariq Maher","Abdullah Al-Khaibari","Saad Al-Muwallad","Khaled Bafflah","Ibrahim Al-Najei","Marcos Acuña"],
  "Al Riyadh":              ["Sultan Al-Nufeisah","Bandar Al-Ahbabi","Mohammed Al-Khaibari","Abdullah Al-Afifi","Abdulaziz Al-Dawsari","Salem Al-Dosari","Ibrahim Dawud","Nadir Al-Ghamdi","Hossam Al-Sharif","Mokhtar Al-Arbi","Yacine Brahimi"],
  "Al Raed":                ["Waleed Al-Bishi","Suleiman Hamdan","Ali Al-Zaqan","Omar Hasan","Khalid Al-Ghamdi","Ahmed Al-Harbi","Mohammed Al-Saiari","Turki Al-Hussaini","Fawaz Amri","Jhon Córdoba","Léo Bonatini"],
  "Abha Club":              ["Faris Al-Sulami","Ali Al-Shahrani","Bassim Al-Harbi","Nasser Al-Ghamdi","Walid Azaro","Mohammed Al-Ahmar","Faisal Al-Ghamdi","Abdullah Al-Zobaidi","Hamdan Al-Anbar","Carlos Tevez","Jhon Córdoba"],
  "Al Wehda":               ["Mohammed Al-Breik","Hussain Al-Mansour","Mohammed Al-Deayea","Saad Al-Harthi","Omar Hasan","Abdullah Al-Otaibi","Firas Al-Buraikan","Talal Al-Harbi","Mansour Al-Maddah","Bounedjah Baghdad","Léandre Tawamba"],
  "Al Ettifaq":             ["Mohammed Al-Deayea","Saud Kariri","Abdullah Hamad","Mohammed Sahel","Nader Al-Ghamdi","Turki Al-Ammar","Fawaz Al-Rashidi","Abdullah Al-Anbar","Mahdi Al-Mattar","Jordan Henderson","Demarai Gray"],
  "Al Khaleej":             ["Ali Al-Habsi","Fahad Al-Hamdan","Mohammed Al-Bishi","Hamid Al-Dawsari","Hassan Al-Hamdan","Abdullah Al-Zobaidi","Mohammed Al-Buraikan","Abdulaziz Al-Dawsari","Firas Al-Buraikan","Morgan Guilavogui","Maxwel Cornet"],
  "Al Okhdood":             ["Turki Al-Ammar","Abdullah Al-Ghamdi","Saad Al-Hamdan","Mohammed Al-Ghamdi","Faisal Al-Hamdan","Khalid Al-Najei","Osama Al-Muwallad","Abdulrahman Hamad","Abdulrahman Al-Qahtani","Saad Al-Harbi","Enzo Pérez"],
  // ── CAF CHAMPIONS LEAGUE ──
  "Al Ahly SC":             ["El Shenawy","Akram Tawfik","Badr Benoun","Ahmed Abdelkader","Omar Kamal","Amr El Sulaya","Aliou Dieng","Emam Ashour","Mohamed Hany","Mohamed Sherif","Percy Tau"],
  "Wydad Athletic Club":    ["Anas Zniti","Yahya Jabrane","Ilias Chair","Achraf Bencharki","Badr Banoun","Mohamed Ounajem","Walid El Karti","Ayoub Lakhal","Mbark Boussoufa","Yohan Benalouane","Boutahar Hamza"],
  "Espérance de Tunis":     ["Moez Ben Chérifia","Sameh Derbali","Zied Boughattas","Haythem Jouini","Kwame Bonsu","Moussa Sissoko","Taha Yassine Khenissi","Anice Badri","Ferjani Sassi","Bilal Ifa","Hamza Mathlouthi"],
  "Mamelodi Sundowns":      ["Ronwen Williams","Mothobi Mvala","Grant Kekana","Rushine de Reuck","Khuliso Mudau","Andile Jali","Bongani Zungu","Themba Zwane","Peter Shalulile","Gaston Sirino","Marcelo Allende"],
  "TP Mazembe":             ["Joël Kiassumbua","Tresor Mputu","Rainier Wa Yaba","Pierrot Mwamba","Mohamed Amine Atoubi","Glody Ngonda","Deo Kanda","Fiston Mayele","Djuma Shabani","Ndikumana","Isaac Ngapandouetnbu"],
  "Zamalek SC":             ["Mohamed Awad","Hamdy Nouh","Naser Maher","Mostafa Mohamed","Tariq Yahia","Ahmed Fatouh","Hazem Emam","Shikabala","Mahmoud Trezeguet","Kahraba","Hussein El Shahat"],
  "Orlando Pirates":        ["Richard Ofori","Thulani Hlatshwayo","Innocent Maela","Paseka Mako","Fortune Makaringe","Ben Motshwari","Deon Hotto","Zakhele Lepasa","Evidence Makgopa","Tshegofatso Mabasa","Kabelo Dlamini"],
  "ASEC Mimosas":           ["Mathieu Doovi","Serge Bayala","Arthur Boka","Souleymane Diabaté","Saliou Ciss","Aboubakar Fofana","Lacina Traoré","Cheick Tioté","Cyriac Gohi","Yaya Touré","Aruna Dindane"],
  "MC Alger":               ["Chaouki Ben Saada","Hichem Belkaroui","Rafik Djebbour","Zakaria Bergheul","Billal Nayef","Houssem Aouar","Farouk Chafai","Abdelmoumen Djabou","Abdelkrim Zouaoui","Islam Slimani","Nabil Bentaleb"],
  "USM Alger":              ["Youcef Chibane","Réda Hamia","Yazid Mansouri","Khaled Lemmouchia","Nassim Bouzid","Hocine Achiou","Sofiane Feghouli","Abdelmalek Ziaya","Walid Soltan","Youcef Belaïli","Rafik Halliche"],
  "ES Sahel":               ["Ben Mustapha","Saad Bguir","Adel Chedli","Bilal Ifa","Mohamed Amine Atoubi","Ferjani Sassi","Hamza Mathlouthi","Ghailene Chaalali","Khalil Chemmam","Taha Yassine Khenissi","Abdelraouf Benguit"],
  "Al Merrikh":             ["Mustafa Khelaifer","Abdelrahman Musa","Abdelrahman Alaa","Zubeir Hamad","Omar El Fatih","Mohammed Anis","Abdelbasit Hamza","Mohammed Abdelrahim","Mudather El Tahir","Bashir Ahmed","Yusuf Mohamed"],
  "ASFA Yennenga":          ["Abdoulaye Soulama","Issouf Sawadogo","Alexis Sawadogo","Adama Traoré","Wilfried Balima","Ahmed Touré","Bernard Yameogo","Farouk Ouédraogo","Lassina Traoré","Yacouba Coulibaly","Bida Belem"],
  "Raja Casablanca":        ["Anas Zniti","Mohamed Khénifra","Ismail Mokadem","Chihab Errami","Hafid Derdak","Faycal Fajr","Mohamed Abed","Mouhcine Iajour","Abdeslam Ouaddou","El Fardou Ben Nabouhane","Youssef Bouzok"],
  "Club Africain":          ["Khalil Chemmam","Ghailene Chaalali","Saad Bguir","Bilal Ifa","Mohamed Amine","Hamza Younes","Alaa Marzouqi","Walid Hichri","Ridha Bouazizi","Saber Khalifa","Ben Khalifa"],
  "Kaizer Chiefs":          ["Itumeleng Khune","Reeve Frosler","Erick Mathoho","Daniel Cardoso","Sifiso Hlanti","Njabulo Blom","Keagan Dolly","Khama Billiat","Samir Nurkovic","Bernard Parker","Leonardo Castro"],
  // ── FIFA WORLD CUP NATIONAL TEAMS ──
  "Brazil":                 ["Alisson Becker","Danilo","Marquinhos","Éder Militão","Alex Sandro","Casemiro","Bruno Guimarães","Lucas Paquetá","Vinicius Jr","Neymar Jr","Richarlison"],
  "Argentina":              ["Emiliano Martínez","Nahuel Molina","Cristian Romero","Nicolás Otamendi","Nicolás Tagliafico","Rodrigo De Paul","Leandro Paredes","Enzo Fernández","Paulo Dybala","Lautaro Martínez","Lionel Messi"],
  "France":                 ["Hugo Lloris","Benjamin Pavard","Raphaël Varane","Dayot Upamecano","Theo Hernández","Aurélien Tchouaméni","Antoine Griezmann","Eduardo Camavinga","Ousmane Dembélé","Marcus Thuram","Kylian Mbappé"],
  "Germany":                ["Manuel Neuer","Joshua Kimmich","Antonio Rüdiger","Niklas Süle","David Raum","Leon Goretzka","İlkay Gündoğan","Leroy Sané","Thomas Müller","Serge Gnabry","Kai Havertz"],
  "Spain":                  ["Unai Simón","Dani Carvajal","Aymeric Laporte","Eric García","Jordi Alba","Sergio Busquets","Pedri","Gavi","Marco Asensio","Ferran Torres","Álvaro Morata"],
  "England":                ["Jordan Pickford","Kyle Walker","John Stones","Harry Maguire","Luke Shaw","Declan Rice","Jude Bellingham","Phil Foden","Bukayo Saka","Marcus Rashford","Harry Kane"],
  "Portugal":               ["Rui Patrício","João Cancelo","Rúben Dias","Pepe","Nuno Mendes","Bernardo Silva","Bruno Fernandes","Vitinha","Rafael Leão","João Félix","Cristiano Ronaldo"],
  "Vietnam":                ["Nguyễn Văn Lâm","Nguyễn Trọng Hoàng","Quế Ngọc Hải","Đỗ Duy Mạnh","Hồ Tấn Tài","Nguyễn Tuấn Anh","Đỗ Hùng Dũng","Nguyễn Quang Hải","Nguyễn Công Phượng","Nguyễn Tiến Linh","Phạm Đức Huy"],
  "Japan":                  ["Shuichi Gonda","Hiroki Sakai","Ko Itakura","Maya Yoshida","Yuto Nagatomo","Hidemasa Morita","Gaku Shibasaki","Junya Ito","Kaoru Mitoma","Daichi Kamada","Ao Tanaka"],
  "South Korea":            ["Kim Seung-gyu","Kim Moon-hwan","Kim Min-jae","Kim Younggwon","Kim Jin-su","Jung Woo-young","Lee Jae-sung","Son Heung-min","Hwang Hee-chan","Hwang Ui-jo","Cho Gue-sung"],
  "USA":                    ["Matt Turner","Sergiño Dest","Walker Zimmerman","Miles Robinson","Antonee Robinson","Tyler Adams","Weston McKennie","Yunus Musah","Christian Pulisic","Timothy Weah","Ricardo Pepi"],
  "Mexico":                 ["Guillermo Ochoa","Jorge Sánchez","César Montes","Héctor Moreno","Jesús Gallardo","Edson Álvarez","Carlos Rodríguez","Jesús Corona","Hirving Lozano","Alexis Vega","Raúl Jiménez"],
  "Netherlands":            ["Andries Noppert","Denzel Dumfries","Virgil van Dijk","Stefan de Vrij","Daley Blind","Frenkie de Jong","Teun Koopmeiners","Steven Berghuis","Cody Gakpo","Davy Klaassen","Memphis Depay"],
  "Italy":                  ["Gianluigi Donnarumma","Giovanni Di Lorenzo","Alessandro Bastoni","Giorgio Chiellini","Leonardo Spinazzola","Marco Verratti","Nicolo Barella","Lorenzo Pellegrini","Federico Chiesa","Lorenzo Insigne","Ciro Immobile"],
  "Belgium":                ["Thibaut Courtois","Toby Alderweireld","Jan Vertonghen","Timothy Castagne","Axel Witsel","Kevin De Bruyne","Leandro Trossard","Yannick Carrasco","Eden Hazard","Dries Mertens","Romelu Lukaku"],
  "Uruguay":                ["Sergio Rochet","Nahitan Nández","Diego Godín","José María Giménez","Mathías Olivera","Rodrigo Bentancur","Lucas Torreira","Matías Vecino","Federico Valverde","Facundo Pellistri","Darwin Núñez"],
  "Croatia":                ["Dominik Livaković","Josip Juranovic","Dejan Lovren","Domagoj Vida","Borna Sosa","Marcelo Brozović","Mateo Kovačić","Luka Modrić","Mario Pašalić","Ivan Perišić","Andrej Kramarić"],
  "Morocco":                ["Yassine Bounou","Achraf Hakimi","Nayef Aguerd","Romain Saïss","Noussair Mazraoui","Selim Amallah","Azzedine Ounahi","Sofyan Amrabat","Hakim Ziyech","Youssef En-Nesyri","Abderrazak Hamdallah"],
  "Senegal":                ["Édouard Mendy","Bouna Sarr","Kalidou Koulibaly","Abdou Diallo","Formose Mendy","Idrissa Gueye","Pape Matar Sarr","Nampalys Mendy","Ismaïla Sarr","Boulaye Dia","Sadio Mané"],
  "Australia":              ["Mat Ryan","Nathaniel Atkinson","Harry Souttar","Kye Rowles","Aziz Behich","Ajdin Hrustic","Riley McGree","Tom Rogic","Mathew Leckie","Mitchell Duke","Martin Boyle"],
  "Canada":                 ["Milan Borjan","Alistair Johnston","Steven Vitória","Kamal Miller","Sam Adekugbe","Stephen Eustáquio","Mark-Anthony Kaye","Jonathan Osorio","Cyle Larin","Tajon Buchanan","Jonathan David"],
  "Saudi Arabia":           ["Mohammed Al-Owais","Sultan Al-Ghannam","Ali Al-Bulaihi","Abdulelah Al-Amri","Yasser Al-Shahrani","Ali Al-Hassan","Salman Al-Faraj","Sami Al-Najei","Salem Al-Dawsari","Fahad Al-Muwallad","Firas Al-Buraikan"],
  "Iran":                   ["Alireza Beiranvand","Ramin Rezaeian","Majid Hosseini","Ehsan Hajsafi","Milad Mohammadi","Saeid Ezatolahi","Alireza Jahanbakhsh","Ali Gholizadeh","Sardar Azmoun","Mehdi Taremi","Karim Ansarifard"],
  "Poland":                 ["Wojciech Szczęsny","Matty Cash","Kamil Glik","Jan Bednarek","Bartosz Bereszyński","Grzegorz Krychowiak","Krystian Bielik","Piotr Zielinski","Przemysław Frankowski","Kamil Jóźwiak","Robert Lewandowski"],
  "Switzerland":            ["Yann Sommer","Silvan Widmer","Manuel Akanji","Nico Elvedi","Ricardo Rodríguez","Remo Freuler","Granit Xhaka","Denis Zakaria","Ruben Vargas","Breel Embolo","Xherdan Shaqiri"],
  "Denmark":                ["Kasper Schmeichel","Joakim Mæhle","Simon Kjær","Andreas Christensen","Jens Stryger Larsen","Pierre-Emile Højbjerg","Thomas Delaney","Christian Eriksen","Mikkel Damsgaard","Andreas Skov Olsen","Kasper Dolberg"],
  "Ghana":                  ["Lawrence Ati Zigi","Andrew Ayew","Alexander Djiku","Daniel Amartey","Gideon Mensah","Baba Rahman","Thomas Partey","Mohammed Kudus","André Ayew","Antoine Semenyo","Inaki Williams"],
  "Cameroon":               ["André Onana","Collins Fai","Jean-Charles Castelletto","Nico Nkoulou","Nouhou","André-Frank Zambo Anguissa","Samuel Gouet","Martin Hongla","Karl Toko Ekambi","Vincent Aboubakar","Nicolas Nkoulou"],
  "Tunisia":                ["Aymen Dahmen","Montassar Talbi","Dylan Bronn","Ali Maaloul","Mohamed Drager","Aïssa Laïdouni","Hannibal Mejbri","Wahbi Khazri","Youssef Msakni","Naïm Sliti","Seifeddine Jaziri"],
  "Ecuador":                ["Hernán Galíndez","Angelo Preciado","Piero Hincapié","William Pacho","Pervis Estupiñán","José Cifuentes","Moisés Caicedo","Jhegson Méndez","Ángel Mena","Gonzalo Plata","Enner Valencia"],
  "Qatar":                  ["Meshaal Barsham","Pedro Miguel","Bassam Al-Rawi","Boualem Khoukhi","Homam Ahmed","Karim Boudiaf","Abdulaziz Hatem","Hassan Al-Haydos","Akram Afif","Almoez Ali","Mohammed Muntari"],
  "Costa Rica":             ["Keylor Navas","Keysher Fuller","Francisco Calvo","Oscar Duarte","Bryan Oviedo","Bryan Ruiz","Yeltsin Tejeda","Celso Borges","Joel Campbell","Anthony Contreras","Joel Campbell"],
  // ── AFC ASIAN CUP NATIONAL TEAMS ──
  "Japan NT":               ["Shuichi Gonda","Hiroki Sakai","Ko Itakura","Maya Yoshida","Yuto Nagatomo","Hidemasa Morita","Junya Ito","Kaoru Mitoma","Daichi Kamada","Ao Tanaka","Yuya Osako"],
  "South Korea NT":         ["Kim Seung-gyu","Kim Moon-hwan","Kim Min-jae","Kim Younggwon","Kim Jin-su","Jung Woo-young","Lee Jae-sung","Son Heung-min","Hwang Hee-chan","Hwang Ui-jo","Lee Kang-in"],
  "Saudi Arabia NT":        ["Mohammed Al-Owais","Sultan Al-Ghannam","Ali Al-Bulaihi","Abdulelah Al-Amri","Yasser Al-Shahrani","Ali Al-Hassan","Salman Al-Faraj","Sami Al-Najei","Salem Al-Dawsari","Firas Al-Buraikan","Fahad Al-Muwallad"],
  "Iran NT":                ["Alireza Beiranvand","Ramin Rezaeian","Majid Hosseini","Ehsan Hajsafi","Milad Mohammadi","Saeid Ezatolahi","Alireza Jahanbakhsh","Ali Gholizadeh","Sardar Azmoun","Mehdi Taremi","Karim Ansarifard"],
  "Australia NT":           ["Mat Ryan","Nathaniel Atkinson","Harry Souttar","Kye Rowles","Aziz Behich","Ajdin Hrustic","Riley McGree","Tom Rogic","Mathew Leckie","Mitchell Duke","Martin Boyle"],
  "Qatar NT":               ["Meshaal Barsham","Pedro Miguel","Bassam Al-Rawi","Boualem Khoukhi","Homam Ahmed","Karim Boudiaf","Abdulaziz Hatem","Hassan Al-Haydos","Akram Afif","Almoez Ali","Mohammed Muntari"],
  "Vietnam NT":             ["Nguyễn Văn Lâm","Nguyễn Trọng Hoàng","Quế Ngọc Hải","Đỗ Duy Mạnh","Hồ Tấn Tài","Nguyễn Tuấn Anh","Đỗ Hùng Dũng","Nguyễn Quang Hải","Nguyễn Công Phượng","Nguyễn Tiến Linh","Phạm Đức Huy"],
  "China NT":               ["Yan Junling","Wang Shenchao","Zhang Linpeng","Jiang Guangtai","Peng Xinli","Wu Lei","Lü Wenjun","Wei Shihao","Tan Long","Alan","Xiao Zhi"],
  "Iraq NT":                ["Jalal Hasan","Ali Adnan","Amjad Attwan","Mohammed Qasim","Hassan Abdulkareem","Safaa Hadi","Ameen Al-Drabea","Hussein Ali","Mohanad Ali","Aymen Hussein","Alaa Abbas"],
  "Jordan NT":              ["Yazid Abu Layla","Ehsan Haddad","Abdullah Nasib","Ahmad Al-Hmoud","Yazan Al-Arab","Baha Faisal","Qusai Abu Layla","Hassan Abdel-Fattah","Musa Al-Tamari","Omar Al-Dardour","Ahmad Hayel"],
  "UAE NT":                 ["Khalid Essa","Bandar Al-Ahbabi","Ismail Al-Hammadi","Walid Abbas","Khamis Esmaeel","Ali Mabkhout","Omar Abdulrahman","Caio Canedo","Sebastian Tagliabue","Fabio Lima","Khalil Ibrahim"],
  "Uzbekistan NT":          ["Eldorbek Smatov","Sanjar Tursunov","Khojiakbar Alijonov","Jasur Jaloliddinov","Islom Tukhtakhujaev","Bobur Abdixoliqov","Jaloliddin Masharipov","Otabek Shukurov","Eldor Shomurodov","Dostonbek Khamdamov","Dostonbek Tursunov"],
  "Tajikistan NT":          ["Rustam Yatimov","Bahodir Saidov","Akbar Tursunov","Faridun Usmonov","Komron Tursunov","Eraj Osmanov","Khayrullo Hamsingov","Mashhur Dzhalilov","Eldor Shomurodov","Firdavs Sadriddinov","Bekhzod Abdurakhimov"],
  "India NT":               ["Gurpreet Singh Sandhu","Rahul Bheke","Sandesh Jhingan","Akash Mishra","Pritam Kotal","Apuia","Brandon Fernandes","Sahal Abdul Samad","Lallianzuala Chhangte","Sunil Chhetri","Manvir Singh"],
  "Bahrain NT":             ["Sayed Mohammed","Sayed Dhiya","Waleed Al-Hayam","Ahmed Al-Hayki","Mohammad Adnan","Hasan Alawi","Mahdi Abduljabbar","Sayed Shubbar","Ismaeel Latif","Komail Al-Aswad","Ali Haram"],
  "Kyrgyzstan NT":          ["Pavel Matiash","Zurab Avaev","Valeri Kichine","Mirlan Murzaev","Aliaskar Sydykov","Vitali Lux","Erlan Abdikaimov","Bekzhan Mamatkanov","Gennadiy Krokhmal","Baktiyar Rysaliev","Aibek Dzhaksybekov"],
  "Oman NT":                ["Faiz Al-Rushaidi","Raed Saleh","Harib Al-Saadi","Abdullah Fawaz","Hassan Yusuf","Mohamad Al-Mushaifri","Salah Al-Yahyaei","Abdullah Al-Hadhri","Muhsen Al-Ghassani","Issam Al-Sabhi","Ahmed Mubarak"],
  "Thailand NT":            ["Kawin Thamsatchanan","Tristan Do","Pansa Hemviboon","Theerathon Bunmathan","Chalermpong Kerdkaew","Chanathip Songkrasin","Sarach Yooyen","Ekanit Panya","Supachok Sarachat","Teerasil Dangda","Pokklaw A-Nan"],
  "Malaysia NT":            ["Khairul Fahmi","Brendan Gan","Aidil Zafuan","Shahrul Saad","Nazmi Faiz","Akram Mahinan","Haziq Nadzli","Safawi Rasid","Faisal Halim","Luqmanul Hakim","Syafiq Ahmad"],
  "Indonesia NT":           ["Nadeo Argawinata","Rizky Ridho","Jordi Amat","Elkan Baggott","Pratama Arhan","Marc Klok","Ivar Jenner","Egy Maulana Vikri","Witan Sulaeman","Rafael Struick","Dimas Drajad"],
  "Philippines NT":         ["Michael Falkesgaard","Neil Etheridge","Sandro Reyes","Kevin Ingreso","Angel Guirado","Stephan Schröck","Amani Aguinaldo","Jo Evolente","Patrick Reichelt","Manuel Ott","Jesper Drent"],
  "Syria NT":               ["Ibrahim Alma","Amro Jenyat","Omar Al-Midani","Ali Dyab","Firas Al-Khatib","Ahmad Al-Saleh","Moayad Ajan","Mahmoud Al-Mawas","Omar Khribin","Youssef Kalfa","Ahmad Al-Sarraj"],
  "Palestine NT":           ["Ramzi Saleh","Musab Battat","Tamer Seyam","Mohammed Rashid","Mahmoud Wadi","Oday Dabbagh","Sameh Maraaba","Ziad Alkord","Yohan Tavares","Khaled Salem","Mohammed Abu Amir"],
  "Kuwait NT":              ["Ahmed Al-Dakhil","Khalid Al-Rashidi","Meshal Dawwas","Hamad Al-Enezi","Ahmed Al-Azemi","Yusuf Naser","Sattam Al-Mezahem","Fahad Al-Awadhi","Yousef Al-Sulaiman","Bader Al-Mutawa","Hussain Fadhel"],
  // ── COPA AMERICA ──
  "Brazil CA":              ["Alisson Becker","Danilo","Marquinhos","Éder Militão","Alex Sandro","Casemiro","Bruno Guimarães","Lucas Paquetá","Vinicius Jr","Rodrygo","Richarlison"],
  "Argentina CA":           ["Emiliano Martínez","Nahuel Molina","Cristian Romero","Nicolás Otamendi","Nicolás Tagliafico","Rodrigo De Paul","Leandro Paredes","Enzo Fernández","Paulo Dybala","Lautaro Martínez","Lionel Messi"],
  "Uruguay CA":             ["Sergio Rochet","Nahitan Nández","Diego Godín","José María Giménez","Mathías Olivera","Rodrigo Bentancur","Lucas Torreira","Federico Valverde","Facundo Pellistri","Darwin Núñez","Luis Suárez"],
  "Chile":                  ["Claudio Bravo","Mauricio Isla","Gary Medel","Guillermo Maripán","Alexis Sánchez","Arturo Vidal","Charles Aránguiz","Pablo Hernández","Erick Pulgar","Ben Brereton Díaz","Eduardo Vargas"],
  "Colombia":               ["David Ospina","Dávinson Sánchez","Yerry Mina","Stefan Medina","Johan Mojica","Jefferson Lerma","Wilmar Barrios","James Rodríguez","Luis Díaz","Duván Zapata","Radamel Falcao"],
  "Peru":                   ["Pedro Gallese","Aldo Corzo","Carlos Zambrano","Miguel Araujo","Miguel Trauco","Renato Tapia","Christofer Gonzales","André Carrillo","Edison Flores","Gianluca Lapadula","Christian Cueva"],
  "Ecuador CA":             ["Hernán Galíndez","Angelo Preciado","Piero Hincapié","William Pacho","Pervis Estupiñán","José Cifuentes","Moisés Caicedo","Jhegson Méndez","Ángel Mena","Gonzalo Plata","Enner Valencia"],
  "Paraguay":               ["Antony Silva","Alberto Espínola","Gustavo Gómez","Fabián Balbuena","Júnior Alonso","Mathías Villasanti","Gastón Giménez","Miguel Almirón","Kike Vera","Roque Santa Cruz","Ángel Romero"],
  "Bolivia":                ["Carlos Lampe","Luis Haquin","Jesús Sagredo","Marcelo Suárez","Marvin Bejarano","Ramiro Vaca","Leonel Justiniano","Jeyson Chura","Pablo Punyed","Carmelo Algarañaz","Marcelo Martins"],
  "Venezuela":              ["Wuilker Faríñez","Rolf Feltscher","Mikel Villanueva","Nahuel Ferraresi","Yordan Osorio","Tomás Rincón","Yangel Herrera","Éder Meza","Salomón Rondón","Jhon Murillo","Josef Martínez"],
  "Mexico CA":              ["Guillermo Ochoa","Jorge Sánchez","César Montes","Héctor Moreno","Jesús Gallardo","Edson Álvarez","Carlos Rodríguez","Jesús Corona","Hirving Lozano","Alexis Vega","Raúl Jiménez"],
  "USA CA":                 ["Matt Turner","Sergiño Dest","Walker Zimmerman","Miles Robinson","Antonee Robinson","Tyler Adams","Weston McKennie","Yunus Musah","Christian Pulisic","Timothy Weah","Ricardo Pepi"],
  "Canada CA":              ["Milan Borjan","Alistair Johnston","Steven Vitória","Kamal Miller","Sam Adekugbe","Stephen Eustáquio","Mark-Anthony Kaye","Jonathan Osorio","Cyle Larin","Tajon Buchanan","Jonathan David"],
  "Jamaica":                ["Andre Blake","Kemar Lawrence","Damion Lowe","Liam Moore","Tyrese Campbell","Bobby Reid","Ravel Morrison","Demarai Gray","Michail Antonio","Leon Bailey","Andre Gray"],
  "Panama":                 ["Luis Mejía","Michael Amir Murillo","Eric Davis","César Blackman","Anibal Godoy","José Fajardo","Gabriel Torres","Adolfo Machado","Ismael Díaz","Rolando Blackburn","Fidel Escobar"],
  "Costa Rica CA":          ["Keylor Navas","Keysher Fuller","Francisco Calvo","Oscar Duarte","Bryan Oviedo","Bryan Ruiz","Yeltsin Tejeda","Celso Borges","Joel Campbell","Anthony Contreras","Johan Venegas"],
  // ── UEFA NATIONS LEAGUE ──
  "Spain UNL":              ["Unai Simón","Dani Carvajal","Aymeric Laporte","Eric García","Jordi Alba","Sergio Busquets","Pedri","Gavi","Marco Asensio","Ferran Torres","Álvaro Morata"],
  "France UNL":             ["Hugo Lloris","Benjamin Pavard","Raphaël Varane","Dayot Upamecano","Theo Hernández","Aurélien Tchouaméni","Antoine Griezmann","Eduardo Camavinga","Ousmane Dembélé","Marcus Thuram","Kylian Mbappé"],
  "Germany UNL":            ["Manuel Neuer","Joshua Kimmich","Antonio Rüdiger","Niklas Süle","David Raum","Leon Goretzka","İlkay Gündoğan","Leroy Sané","Thomas Müller","Serge Gnabry","Kai Havertz"],
  "Portugal UNL":           ["Rui Patrício","João Cancelo","Rúben Dias","Pepe","Nuno Mendes","Bernardo Silva","Bruno Fernandes","Vitinha","Rafael Leão","João Félix","Cristiano Ronaldo"],
  "England UNL":            ["Jordan Pickford","Kyle Walker","John Stones","Harry Maguire","Luke Shaw","Declan Rice","Jude Bellingham","Phil Foden","Bukayo Saka","Marcus Rashford","Harry Kane"],
  "Netherlands UNL":        ["Andries Noppert","Denzel Dumfries","Virgil van Dijk","Stefan de Vrij","Daley Blind","Frenkie de Jong","Teun Koopmeiners","Steven Berghuis","Cody Gakpo","Davy Klaassen","Memphis Depay"],
  "Italy UNL":              ["Gianluigi Donnarumma","Giovanni Di Lorenzo","Alessandro Bastoni","Giorgio Chiellini","Leonardo Spinazzola","Marco Verratti","Nicolo Barella","Lorenzo Pellegrini","Federico Chiesa","Lorenzo Insigne","Ciro Immobile"],
  "Belgium UNL":            ["Thibaut Courtois","Toby Alderweireld","Jan Vertonghen","Timothy Castagne","Axel Witsel","Kevin De Bruyne","Leandro Trossard","Yannick Carrasco","Eden Hazard","Dries Mertens","Romelu Lukaku"],
  "Croatia UNL":            ["Dominik Livaković","Josip Juranovic","Dejan Lovren","Domagoj Vida","Borna Sosa","Marcelo Brozović","Mateo Kovačić","Luka Modrić","Mario Pašalić","Ivan Perišić","Andrej Kramarić"],
  "Switzerland UNL":        ["Yann Sommer","Silvan Widmer","Manuel Akanji","Nico Elvedi","Ricardo Rodríguez","Remo Freuler","Granit Xhaka","Denis Zakaria","Ruben Vargas","Breel Embolo","Xherdan Shaqiri"],
  "Denmark UNL":            ["Kasper Schmeichel","Joakim Mæhle","Simon Kjær","Andreas Christensen","Jens Stryger Larsen","Pierre-Emile Højbjerg","Thomas Delaney","Christian Eriksen","Mikkel Damsgaard","Andreas Skov Olsen","Kasper Dolberg"],
  "Austria":                ["Daniel Bachmann","Stefan Lainer","David Alaba","Martin Hinteregger","Philipp Lienhart","Konrad Laimer","Marcel Sabitzer","Florian Grillitsch","Christoph Baumgartner","Michael Gregoritsch","Marko Arnautovic"],
  "Turkey":                 ["Uğur Çakır","Zeki Çelik","Merih Demiral","Çağlar Söyüncü","Ferdi Kadıoğlu","Salih Özcan","Hakan Çalhanoğlu","Arda Güler","Kerem Aktürkoğlu","Cenk Tosun","Burak Yılmaz"],
  "Serbia":                 ["Vanja Milinković-Savić","Nikola Milenković","Strahinja Pavlović","Stefan Mitrović","Filip Kostić","Sergej Milinković-Savić","Nemanja Maksimović","Dušan Tadić","Luka Jović","Dušan Vlahović","Aleksandar Mitrović"],
  "Hungary":                ["Péter Gulácsi","Loïc Nego","Attila Fiola","Willi Orbán","Ádám Lang","Ádám Nagy","Dávid Siger","Dániel Gazdag","Roland Sallai","Dominik Szoboszlai","Ádám Szalai"],
  "Scotland":               ["Craig Gordon","Aaron Hickey","Liam Cooper","Grant Hanley","Andy Robertson","Callum McGregor","Billy Gilmour","John McGinn","Ryan Fraser","Ryan Christie","Lyndon Dykes"],
};

// ── PLAYER GENERATION ────────────────────────────────────────────────────────
const POSITIONS = ["GK","CB","CB","LB","RB","CDM","CM","CAM","LW","RW","ST"] as const;
function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makePlayers(teamId: number, teamName: string, country: string): Omit<typeof playersTable.$inferInsert, "id">[] {
  const names = KNOWN_PLAYERS[teamName];
  const fallbackName = (i: number) => {
    const pos = POSITIONS[i];
    return `Player ${pos}${i + 1}`;
  };
  const playerNames = names ?? POSITIONS.map((_, i) => fallbackName(i));
  return POSITIONS.map((pos, i) => {
    const isAttacker = ["ST","CAM","LW","RW"].includes(pos);
    const isDefender = ["GK","CB","LB","RB"].includes(pos);
    const pName = playerNames[i] ?? fallbackName(i);
    return {
      name: pName,
      displayName: pName.split(" ").pop()!,
      nationality: country,
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

// ── SEED ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Starting Phase 2 seed…");

  await db.delete(standingsTable);
  await db.delete(matchesTable);
  await db.delete(playersTable);
  await db.delete(teamsTable);
  await db.delete(leaguesTable);
  console.log("🗑️  Cleared existing data");

  const insertedLeagues = await db.insert(leaguesTable).values(LEAGUES.map(l => ({ ...l }))).returning();
  const leagueByName = new Map(insertedLeagues.map(l => [l.name, l]));
  console.log(`✅ ${insertedLeagues.length} leagues`);

  const teamInserts: Omit<typeof teamsTable.$inferInsert, "id">[] = [];
  for (const [leagueName, teams] of Object.entries(TEAMS) as [LeagueName, TeamDef[]][]) {
    const league = leagueByName.get(leagueName);
    if (!league) { console.warn(`⚠️  League not found: ${leagueName}`); continue; }
    for (const t of teams) teamInserts.push({
      name: t.name, shortName: t.shortName, country: t.country,
      region: t.region ?? league.region, type: t.type ?? "club",
      stadiumName: t.stadiumName, founded: t.founded,
      primaryColor: t.primaryColor, secondaryColor: t.secondaryColor,
      leagueId: league.id,
    });
  }
  // Insert in batches of 50
  const insertedTeams: typeof teamsTable.$inferSelect[] = [];
  for (let i = 0; i < teamInserts.length; i += 50)
    insertedTeams.push(...await db.insert(teamsTable).values(teamInserts.slice(i, i + 50)).returning());
  console.log(`✅ ${insertedTeams.length} teams`);

  const clubTeams = insertedTeams.filter(t => t.type === "club");
  const playerRows: Omit<typeof playersTable.$inferInsert, "id">[] = [];
  for (const team of clubTeams) playerRows.push(...makePlayers(team.id, team.name, team.country));
  for (let i = 0; i < playerRows.length; i += 100)
    await db.insert(playersTable).values(playerRows.slice(i, i + 100));
  console.log(`✅ ${playerRows.length} players`);

  // Matches — round-robin within each club league (limit to 14 rounds for large leagues)
  const today = new Date();
  const matchRows: Omit<typeof matchesTable.$inferInsert, "id">[] = [];
  const teamsByLeague = new Map<number, typeof insertedTeams>();
  for (const team of clubTeams) {
    if (!team.leagueId) continue;
    if (!teamsByLeague.has(team.leagueId)) teamsByLeague.set(team.leagueId, []);
    teamsByLeague.get(team.leagueId)!.push(team);
  }

  for (const [leagueId, teams] of teamsByLeague) {
    const pairs: [typeof teams[0], typeof teams[0]][] = [];
    for (let i = 0; i < teams.length; i++)
      for (let j = i + 1; j < teams.length; j++)
        pairs.push([teams[i], teams[j]]);

    // Limit matches for large leagues so DB doesn't get huge
    const maxMatches = Math.min(pairs.length, 120);
    const selectedPairs = pairs.slice(0, maxMatches);

    for (const [home, away] of selectedPairs) {
      const daysOffset = rnd(-150, 90);
      const matchDate = new Date(today);
      matchDate.setDate(matchDate.getDate() + daysOffset);
      let status: "finished"|"live"|"upcoming" = "upcoming";
      let homeScore: number|null = null, awayScore: number|null = null, minute: number|null = null;
      if (daysOffset < -1) { status = "finished"; homeScore = rnd(0,5); awayScore = rnd(0,4); }
      else if (daysOffset === 0 && Math.random() > 0.5) { status = "live"; homeScore = rnd(0,3); awayScore = rnd(0,2); minute = rnd(1,90); }
      matchRows.push({ homeTeamId: home.id, awayTeamId: away.id, leagueId, status, scheduledAt: matchDate, homeScore, awayScore, minute, venue: home.stadiumName ?? undefined });
    }
  }
  for (let i = 0; i < matchRows.length; i += 100)
    await db.insert(matchesTable).values(matchRows.slice(i, i + 100));
  console.log(`✅ ${matchRows.length} matches`);

  // Standings
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

  console.log("🎉 Phase 2 seed complete!");
  await pool.end();
}

seed().catch(err => { console.error("❌ Seed failed:", err); pool.end(); process.exit(1); });
