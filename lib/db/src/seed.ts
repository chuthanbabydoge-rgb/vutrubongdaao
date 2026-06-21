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

// ── KNOWN PLAYERS (11 per team for major clubs) ───────────────────────────────
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
  "VfB Stuttgart":          ["Fabian Bredlow","Pascal Stenzel","Dan-Axel Zagadou","Konstantinos Mavropanos","Maximilian Mittelstädt","Chris Führich","Wataru Endō","Angelo Stiller","Silas Katompa","Serhou Guirassy","Deniz Undav"],
  "Juventus FC":            ["Wojciech Szczęsny","Andrea Cambiaso","Gleison Bremer","Federico Gatti","Alex Sandro","Nicolò Fagioli","Adrien Rabiot","Weston McKennie","Federico Chiesa","Filip Kostić","Dušan Vlahović"],
  "AC Milan":               ["Mike Maignan","Davide Calabria","Fikayo Tomori","Malick Thiaw","Theo Hernández","Ruben Loftus-Cheek","Tijjani Reijnders","Yunus Musah","Christian Pulisic","Rafael Leão","Olivier Giroud"],
  "Inter Milan":            ["Yann Sommer","Denzel Dumfries","Francesco Acerbi","Alessandro Bastoni","Federico Dimarco","Nicolò Barella","Hakan Çalhanoğlu","Henrikh Mkhitaryan","Matteo Darmian","Marcus Thuram","Lautaro Martínez"],
  "AS Roma":                ["Rui Patrício","Rick Karsdorp","Gianluca Mancini","Chris Smalling","Angeliño","Leandro Paredes","Lorenzo Pellegrini","Paulo Dybala","Stephan El Shaarawy","Tammy Abraham","Romelu Lukaku"],
  "SSC Napoli":             ["Alex Meret","Giovanni Di Lorenzo","Min-jae Kim","Amir Rrahmani","Mathías Olivera","Piotr Zielinski","Stanislav Lobotka","Eljif Elmas","Khvicha Kvaratskhelia","Hirving Lozano","Victor Osimhen"],
  "Atalanta BC":            ["Juan Musso","Rafael Tolói","Isak Hien","Giorgio Scalvini","Joakim Mæhle","Marten de Roon","Ederson","Teun Koopmeiners","Aleksei Miranchuk","Charles De Ketelaere","Gianluca Scamacca"],
  "ACF Fiorentina":         ["Pietro Terracciano","Dodo","Nikola Milenković","Lucas Quarta","Cristiano Biraghi","Rolando Mandragora","Arthur","Gaetano Castrovilli","Nicolás González","Jonathan Ikoné","Luca Jović"],
  "SS Lazio":               ["Ivan Provedel","Manuel Lazzari","Mario Gila","Alessio Romagnoli","Dimitrij Luku-Samba","Mattia Zaccagni","Luis Alberto","Sergej Milinković-Savić","Felipe Anderson","Pedro","Ciro Immobile"],
  "Paris Saint-Germain":    ["Gianluigi Donnarumma","Achraf Hakimi","Marquinhos","Lucas Hernández","Nuno Mendes","Vitinha","Manuel Ugarte","Warren Zaïre-Emery","Bradley Barcola","Ousmane Dembélé","Randal Kolo Muani"],
  "Olympique de Marseille": ["Pau López","Jonathan Clauss","Samuel Gigot","Leonardo Balerdi","Nuno Tavares","Valentin Rongier","Jordan Veretout","Mattéo Guendouzi","Amine Harit","Alexis Sánchez","Pierre-Emerick Aubameyang"],
  "Olympique Lyonnais":     ["Lucas Perri","Malo Gusto","Castello Lukeba","Nicolas Tagliafico","Maxence Caqueret","Johann Lepenant","Corentin Tolisso","Romain Faivre","Tetê","Ernest Nuamah","Alexandre Lacazette"],
  "AS Monaco":              ["Philipp Köhn","Vanderson","Axel Disasi","Benoît Badiashile","Caio Henrique","Youssouf Fofana","Jean Lucas","Maghnes Akliouche","Krépin Diatta","Takumi Minamino","Wissam Ben Yedder"],
  "Hà Nội FC":              ["Tấn Trường","Thành Chung","Đình Trọng","Văn Kiên","Hùng Dũng","Văn Quyết","Quang Hải","Thái Sơn","Đức Chinh","Tiến Linh","Văn Toàn"],
  "Hoàng Anh Gia Lai":      ["Văn Lâm","Văn Thanh","Hồng Duy","Tấn Sinh","Đức Lương","Thanh Bình","Xuân Trường","Công Phượng","Minh Vương","Văn Tùng","Đình Bảo"],
  "SHB Đà Nẵng":            ["Tuấn Mạnh","Xuân Mạnh","Hải Thuỳ","Minh Hiếu","Quý Hạnh","Quang Phúc","Thanh Hiền","Thành Luân","Ngọc Sơn","Trọng Hùng","Việt Cường"],
  "Viettel FC":             ["Phí Minh Long","Việt Anh","Bùi Hoàng Việt Anh","Ngô Tùng Quốc","Trần Đình Trọng","Hoàng Đức","Nguyễn Hai Long","Nguyễn Trọng Hoàng","Từ Hiển Đạt","Nguyễn Tiến Linh","Bùi Vĩ Hào"],
  "Al Hilal SFC":           ["Yassine Bounou","Saud Abdulhamid","Kalidou Koulibaly","Ali Al-Bulaihi","João Cancelo","Ruben Neves","Sergej Milinković-Savić","Sandro Tonali","Michael Estrada","Aleksandar Mitrović","Neymar Jr"],
  "Al Nassr FC":            ["Bento","Salmeen Al-Motairi","Aymeric Laporte","Marcelo Brozović","Ali Lajami","Sami Al-Najei","Luiz Gustavo","Sadio Mané","Abdulrahman Ghareeb","Anderson Talisca","Cristiano Ronaldo"],
  "Al Ittihad Club":        ["Marcelo Grohe","Siyabonga Ngezana","Jota","Fabinho","N'Golo Kanté","Romarinho","Karim Benzema","Riyad Mahrez","Roberto Firmino","Luiz Felipe","Naif Aguerd"],
  "Al Ahli Saudi FC":       ["Edouard Mendy","Saud Abdulhamid","Roger Ibañez","Merih Demiral","Bruno","Gabri Veiga","Franck Kessié","Allan Saint-Maximin","Ivan Toney","Ryan Babel","Roberto Firmino"],
  "Inter Miami CF":         ["Drake Callender","DeAndre Yedlin","Tomás Avilés","Sergio Busquets","Jordi Alba","Alejandro Pozuelo","Benjamin Cremaschi","Robert Taylor","Lionel Messi","Josef Martínez","Leonardo Campana"],
  "CR Flamengo":            ["Santos","Fabrício Bruno","David Luiz","Léo Pereira","Filipe Luís","Everton Ribeiro","João Gomes","Giorgian De Arrascaeta","Éverton Cebolinha","Gabigol","Pedro"],
  "SE Palmeiras":           ["Weverton","Marcos Rocha","Gustavo Gómez","Murilo","Piquerez","Danilo","Raphael Veiga","Rony","Dudu","Endrick","Flaco López"],
  "SC Corinthians":         ["Cássio","Rafael Ramos","Gil","Lucas Veríssimo","Fábio Santos","Maycon","Renato Augusto","Giuliano","Róger Guedes","Yuri Alberto","Gustavo Mantuan"],
  "Al Ahly SC":             ["El Shenawy","Akram Tawfik","Badr Benoun","Ahmed Abdelkader","Omar Kamal","Amr El Sulaya","Aliou Dieng","Emam Ashour","Mohamed Hany","Mohamed Sherif","Percy Tau"],
  "Mamelodi Sundowns":      ["Ronwen Williams","Mothobi Mvala","Grant Kekana","Rushine de Reuck","Khuliso Mudau","Andile Jali","Bongani Zungu","Themba Zwane","Peter Shalulile","Gaston Sirino","Marcelo Allende"],
};

// ── PLAYER GENERATION ────────────────────────────────────────────────────────
const POSITIONS = ["GK","CB","CB","LB","RB","CDM","CM","CAM","LW","RW","ST"] as const;
function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makePlayers(teamId: number, teamName: string): Omit<typeof playersTable.$inferInsert, "id">[] {
  const names = KNOWN_PLAYERS[teamName] ?? POSITIONS.map((_, i) => `${teamName.split(" ")[0]} P${i + 1}`);
  return POSITIONS.map((pos, i) => {
    const isAttacker = ["ST","CAM","LW","RW"].includes(pos);
    const isDefender = ["GK","CB","LB","RB"].includes(pos);
    return {
      name: names[i] ?? `${teamName.split(" ")[0]} P${i + 1}`,
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
  for (const team of clubTeams) playerRows.push(...makePlayers(team.id, team.name));
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
