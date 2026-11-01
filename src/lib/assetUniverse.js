/**
 * Asset Universe — the single searchable manifest for the whole app.
 *
 * Every entry carries: symbol, name, type (stock | etf | crypto | commodity |
 * forex), sector and region. `region` drives the Markets region filter and the
 * news "Affects" filter, so it means where the issuer/company is domiciled
 * (US · Europe · Asia · Latin America · Africa · Global for cross-border
 * instruments such as indices, FX and commodities).
 *
 * MIRRORED IN THE BACKEND: base44/shared/assetSymbols.ts is generated from this
 * file (same symbols, names and regions). If you add a symbol here, add it
 * there too — the backend uses it to decide which tickers may be tagged on news.
 *
 * Prices are NEVER bundled here. Metadata only; quotes come from marketCore.
 */

// ── REGIONS (Markets filter chips) ──────────────────────────────────────────
export const REGION_IDS = ['All', 'US', 'Europe', 'Asia', 'Latin America', 'Africa', 'Global'];
export const DEFAULT_REGION = 'All';

// ── US STOCKS: S&P 500 + Nasdaq 100 + the app's popular list ────────────────
const US_STOCKS = [
  ['AAPL', 'Apple', 'Technology'], ['MSFT', 'Microsoft', 'Technology'],
  ['NVDA', 'NVIDIA', 'Semiconductors'], ['GOOGL', 'Alphabet A', 'Technology'],
  ['GOOG', 'Alphabet C', 'Technology'], ['AMZN', 'Amazon', 'Consumer'],
  ['META', 'Meta Platforms', 'Technology'], ['TSLA', 'Tesla', 'Automotive'],
  ['AVGO', 'Broadcom', 'Semiconductors'], ['BRK.B', 'Berkshire Hathaway', 'Finance'],
  ['JPM', 'JPMorgan Chase', 'Finance'], ['LLY', 'Eli Lilly', 'Healthcare'],
  ['V', 'Visa', 'Finance'], ['MA', 'Mastercard', 'Finance'],
  ['XOM', 'Exxon Mobil', 'Energy'], ['UNH', 'UnitedHealth', 'Healthcare'],
  ['COST', 'Costco', 'Retail'], ['HD', 'Home Depot', 'Retail'],
  ['PG', 'Procter & Gamble', 'Consumer'], ['JNJ', 'Johnson & Johnson', 'Healthcare'],
  ['WMT', 'Walmart', 'Retail'], ['NFLX', 'Netflix', 'Media'],
  ['ABBV', 'AbbVie', 'Healthcare'], ['CRM', 'Salesforce', 'Software'],
  ['BAC', 'Bank of America', 'Finance'], ['ORCL', 'Oracle', 'Software'],
  ['CVX', 'Chevron', 'Energy'], ['MRK', 'Merck', 'Healthcare'],
  ['KO', 'Coca-Cola', 'Beverages'], ['AMD', 'AMD', 'Semiconductors'],
  ['PEP', 'PepsiCo', 'Beverages'], ['TMO', 'Thermo Fisher', 'Healthcare'],
  ['ADBE', 'Adobe', 'Software'], ['LIN', 'Linde', 'Materials'],
  ['CSCO', 'Cisco', 'Technology'], ['ACN', 'Accenture', 'Technology'],
  ['MCD', "McDonald's", 'Restaurant'], ['ABT', 'Abbott Laboratories', 'Healthcare'],
  ['INTU', 'Intuit', 'Software'], ['WFC', 'Wells Fargo', 'Finance'],
  ['QCOM', 'Qualcomm', 'Semiconductors'], ['TXN', 'Texas Instruments', 'Semiconductors'],
  ['DHR', 'Danaher', 'Healthcare'], ['AMGN', 'Amgen', 'Healthcare'],
  ['PM', 'Philip Morris', 'Consumer'], ['IBM', 'IBM', 'Technology'],
  ['CAT', 'Caterpillar', 'Industrials'], ['GE', 'GE Aerospace', 'Industrials'],
  ['NOW', 'ServiceNow', 'Software'], ['UBER', 'Uber', 'Technology'],
  ['SPGI', 'S&P Global', 'Finance'], ['RTX', 'RTX', 'Industrials'],
  ['PFE', 'Pfizer', 'Healthcare'], ['UNP', 'Union Pacific', 'Industrials'],
  ['LOW', 'Lowe\'s', 'Retail'], ['HON', 'Honeywell', 'Industrials'],
  ['GS', 'Goldman Sachs', 'Finance'], ['BLK', 'BlackRock', 'Finance'],
  ['MS', 'Morgan Stanley', 'Finance'], ['C', 'Citigroup', 'Finance'],
  ['SCHW', 'Charles Schwab', 'Finance'], ['AXP', 'American Express', 'Finance'],
  ['BKNG', 'Booking Holdings', 'Travel'], ['TJX', 'TJX Companies', 'Retail'],
  ['VRTX', 'Vertex Pharmaceuticals', 'Healthcare'], ['REGN', 'Regeneron', 'Healthcare'],
  ['GILD', 'Gilead Sciences', 'Healthcare'], ['MDT', 'Medtronic', 'Healthcare'],
  ['SYK', 'Stryker', 'Healthcare'], ['ISRG', 'Intuitive Surgical', 'Healthcare'],
  ['AMAT', 'Applied Materials', 'Semiconductors'], ['LRCX', 'Lam Research', 'Semiconductors'],
  ['MU', 'Micron', 'Semiconductors'], ['KLAC', 'KLA', 'Semiconductors'],
  ['ADI', 'Analog Devices', 'Semiconductors'], ['INTC', 'Intel', 'Semiconductors'],
  ['PANW', 'Palo Alto Networks', 'Software'], ['SNPS', 'Synopsys', 'Software'],
  ['CDNS', 'Cadence Design', 'Software'], ['FTNT', 'Fortinet', 'Software'],
  ['ADP', 'ADP', 'Software'], ['PYPL', 'PayPal', 'FinTech'],
  ['COIN', 'Coinbase', 'Crypto'], ['PLTR', 'Palantir', 'Software'],
  ['SNOW', 'Snowflake', 'Software'], ['DDOG', 'Datadog', 'Software'],
  ['CRWD', 'CrowdStrike', 'Software'], ['ZS', 'Zscaler', 'Software'],
  ['MDB', 'MongoDB', 'Software'], ['TEAM', 'Atlassian', 'Software'],
  ['WDAY', 'Workday', 'Software'], ['VEEV', 'Veeva Systems', 'Software'],
  ['ROP', 'Roper Technologies', 'Technology'], ['ANSS', 'Ansys', 'Software'],
  ['MSTR', 'MicroStrategy', 'Crypto'], ['MARA', 'Marathon Digital', 'Crypto'],
  ['RIOT', 'Riot Platforms', 'Crypto'], ['HOOD', 'Robinhood', 'FinTech'],
  ['SOFI', 'SoFi Technologies', 'FinTech'], ['UPST', 'Upstart', 'FinTech'],
  ['AFRM', 'Affirm', 'FinTech'], ['SQ', 'Block', 'FinTech'],
  ['SHOP', 'Shopify', 'Software'], ['RBLX', 'Roblox', 'Gaming'],
  ['U', 'Unity Software', 'Gaming'], ['EA', 'Electronic Arts', 'Gaming'],
  ['TTWO', 'Take-Two', 'Gaming'], ['SPOT', 'Spotify', 'Media'],
  ['DIS', 'Walt Disney', 'Media'], ['CMCSA', 'Comcast', 'Media'],
  ['T', 'AT&T', 'Telecom'], ['VZ', 'Verizon', 'Telecom'],
  ['TMUS', 'T-Mobile US', 'Telecom'], ['NKE', 'Nike', 'Retail'],
  ['SBUX', 'Starbucks', 'Restaurant'], ['CMG', 'Chipotle', 'Restaurant'],
  ['MDLZ', 'Mondelez', 'Consumer'], ['MO', 'Altria', 'Consumer'],
  ['KHC', 'Kraft Heinz', 'Consumer'], ['GIS', 'General Mills', 'Consumer'],
  ['CL', 'Colgate-Palmolive', 'Consumer'], ['KMB', 'Kimberly-Clark', 'Consumer'],
  ['EL', 'Estée Lauder', 'Consumer'], ['LULU', 'Lululemon', 'Retail'],
  ['TGT', 'Target', 'Retail'], ['DG', 'Dollar General', 'Retail'],
  ['DLTR', 'Dollar Tree', 'Retail'], ['ROST', 'Ross Stores', 'Retail'],
  ['ORLY', 'O\'Reilly Automotive', 'Retail'], ['AZO', 'AutoZone', 'Retail'],
  ['F', 'Ford', 'Automotive'], ['GM', 'General Motors', 'Automotive'],
  ['RIVN', 'Rivian', 'Automotive'], ['LCID', 'Lucid Group', 'Automotive'],
  ['BA', 'Boeing', 'Industrials'], ['LMT', 'Lockheed Martin', 'Defense'],
  ['NOC', 'Northrop Grumman', 'Defense'], ['GD', 'General Dynamics', 'Defense'],
  ['DE', 'Deere', 'Industrials'], ['EMR', 'Emerson Electric', 'Industrials'],
  ['ETN', 'Eaton', 'Industrials'], ['ITW', 'Illinois Tool Works', 'Industrials'],
  ['MMM', '3M', 'Industrials'], ['UPS', 'UPS', 'Logistics'],
  ['FDX', 'FedEx', 'Logistics'], ['DAL', 'Delta Air Lines', 'Airlines'],
  ['UAL', 'United Airlines', 'Airlines'], ['LUV', 'Southwest Airlines', 'Airlines'],
  ['MAR', 'Marriott', 'Travel'], ['HLT', 'Hilton', 'Travel'],
  ['ABNB', 'Airbnb', 'Travel'], ['DASH', 'DoorDash', 'Technology'],
  ['LYFT', 'Lyft', 'Technology'], ['PINS', 'Pinterest', 'Media'],
  ['SNAP', 'Snap', 'Media'], ['ROKU', 'Roku', 'Media'],
  ['NEE', 'NextEra Energy', 'Utilities'], ['DUK', 'Duke Energy', 'Utilities'],
  ['SO', 'Southern Company', 'Utilities'], ['AEP', 'American Electric Power', 'Utilities'],
  ['AMT', 'American Tower', 'Real Estate'], ['PLD', 'Prologis', 'Real Estate'],
  ['EQIX', 'Equinix', 'Real Estate'], ['SPG', 'Simon Property', 'Real Estate'],
  ['FCX', 'Freeport-McMoRan', 'Materials'], ['NEM', 'Newmont', 'Materials'],
  ['ALB', 'Albemarle', 'Materials'], ['DOW', 'Dow', 'Materials'],
  ['PSX', 'Phillips 66', 'Energy'], ['MPC', 'Marathon Petroleum', 'Energy'],
  ['OXY', 'Occidental Petroleum', 'Energy'], ['SLB', 'SLB', 'Energy'],
  ['HAL', 'Halliburton', 'Energy'], ['KMI', 'Kinder Morgan', 'Energy'],
  ['WMB', 'Williams Companies', 'Energy'], ['OKE', 'ONEOK', 'Energy'],
  ['VST', 'Vistra', 'Utilities'], ['CEG', 'Constellation Energy', 'Utilities'],
  ['CVS', 'CVS Health', 'Healthcare'], ['CI', 'Cigna', 'Healthcare'],
  ['HUM', 'Humana', 'Healthcare'], ['MRNA', 'Moderna', 'Healthcare'],
  ['BIIB', 'Biogen', 'Healthcare'], ['ZTS', 'Zoetis', 'Healthcare'],
  ['SMCI', 'Super Micro Computer', 'Hardware'], ['DELL', 'Dell Technologies', 'Hardware'],
  ['HPQ', 'HP', 'Hardware'], ['WDC', 'Western Digital', 'Hardware'],
  ['STX', 'Seagate', 'Hardware'], ['ON', 'ON Semiconductor', 'Semiconductors'],
  ['ARM', 'Arm Holdings', 'Semiconductors'], ['MRVL', 'Marvell', 'Semiconductors'],
  ['NXPI', 'NXP Semiconductors', 'Semiconductors'], ['GFS', 'GlobalFoundries', 'Semiconductors'],
];

// ── GLOBAL STOCKS: large non-US companies via US-listed ADRs ────────────────
const EUROPE_STOCKS = [
  ['ASML', 'ASML Holding', 'Semiconductors'], ['SAP', 'SAP', 'Software'],
  ['NVO', 'Novo Nordisk', 'Healthcare'], ['NVS', 'Novartis', 'Healthcare'],
  ['AZN', 'AstraZeneca', 'Healthcare'], ['GSK', 'GSK', 'Healthcare'],
  ['SNY', 'Sanofi', 'Healthcare'], ['UL', 'Unilever', 'Consumer'],
  ['DEO', 'Diageo', 'Beverages'], ['BTI', 'British American Tobacco', 'Consumer'],
  ['SHEL', 'Shell', 'Energy'], ['BP', 'BP', 'Energy'],
  ['TTE', 'TotalEnergies', 'Energy'], ['E', 'Eni', 'Energy'],
  ['EQNR', 'Equinor', 'Energy'], ['HSBC', 'HSBC Holdings', 'Finance'],
  ['UBS', 'UBS Group', 'Finance'], ['ING', 'ING Groep', 'Finance'],
  ['SAN', 'Banco Santander', 'Finance'], ['BBVA', 'BBVA', 'Finance'],
  ['DB', 'Deutsche Bank', 'Finance'], ['ACA', 'Credit Agricole', 'Finance'],
  ['ALIZY', 'Allianz', 'Finance'], ['MURGY', 'Munich Re', 'Finance'],
  ['STLA', 'Stellantis', 'Automotive'], ['BMWYY', 'BMW', 'Automotive'],
  ['MBGYY', 'Mercedes-Benz', 'Automotive'], ['VWAGY', 'Volkswagen', 'Automotive'],
  ['ADDYY', 'adidas', 'Retail'], ['LVMUY', 'LVMH', 'Luxury'],
  ['CFRUY', 'Richemont', 'Luxury'], ['KER', 'Kering', 'Luxury'],
  ['SIEGY', 'Siemens', 'Industrials'], ['BASFY', 'BASF', 'Materials'],
  ['BAYRY', 'Bayer', 'Healthcare'], ['DTEGY', 'Deutsche Telekom', 'Telecom'],
  ['ERIC', 'Ericsson', 'Technology'], ['NOK', 'Nokia', 'Technology'],
  ['VLVLY', 'Volvo Group', 'Industrials'], ['RNLSY', 'Renault', 'Automotive'],
  ['RKT', 'Reckitt Benckiser', 'Consumer'], ['RELX', 'RELX', 'Media'],
  ['CRH', 'CRH', 'Materials'], ['RYAAY', 'Ryanair', 'Airlines'],
  ['AER', 'AerCap', 'Finance'], ['WPP', 'WPP', 'Media'],
  ['PHG', 'Philips', 'Healthcare'], ['ABBNY', 'ABB', 'Industrials'],
  ['SDVKY', 'Sandvik', 'Industrials'], ['ATLKY', 'Atlas Copco', 'Industrials'],
  ['SKFRY', 'SKF', 'Industrials'], ['HEINY', 'Heineken', 'Beverages'],
  ['CABGY', 'Carlsberg', 'Beverages'], ['PDRDY', 'Pernod Ricard', 'Beverages'],
  ['CHKP', 'Check Point Software', 'Software'], ['TEVA', 'Teva Pharmaceutical', 'Healthcare'],
  ['ADYYY', 'Adyen', 'FinTech'], ['PRX', 'Prosus', 'Technology'],
  ['FER', 'Ferrovial', 'Industrials'], ['IBE', 'Iberdrola', 'Utilities'],
  ['ENEL', 'Enel', 'Utilities'], ['ENGIY', 'Engie', 'Utilities'],
  ['TRMD', 'Torm', 'Shipping'], ['MAERSK', 'A.P. Moller Maersk', 'Shipping'],
];

const ASIA_STOCKS = [
  ['TSM', 'TSMC', 'Semiconductors'], ['TM', 'Toyota Motor', 'Automotive'],
  ['SONY', 'Sony Group', 'Technology'], ['HMC', 'Honda Motor', 'Automotive'],
  ['MUFG', 'Mitsubishi UFJ', 'Finance'], ['SMFG', 'Sumitomo Mitsui', 'Finance'],
  ['MFG', 'Mizuho Financial', 'Finance'], ['NMR', 'Nomura', 'Finance'],
  ['BABA', 'Alibaba', 'Consumer'], ['PDD', 'PDD Holdings', 'Consumer'],
  ['JD', 'JD.com', 'Consumer'], ['NTES', 'NetEase', 'Gaming'],
  ['BIDU', 'Baidu', 'Technology'], ['TCEHY', 'Tencent', 'Technology'],
  ['BILI', 'Bilibili', 'Media'], ['BEKE', 'KE Holdings', 'Real Estate'],
  ['YUMC', 'Yum China', 'Restaurant'], ['ZTO', 'ZTO Express', 'Logistics'],
  ['TCOM', 'Trip.com', 'Travel'], ['LI', 'Li Auto', 'Automotive'],
  ['NIO', 'NIO', 'Automotive'], ['XPEV', 'XPeng', 'Automotive'],
  ['HDB', 'HDFC Bank', 'Finance'], ['IBN', 'ICICI Bank', 'Finance'],
  ['INFY', 'Infosys', 'Software'], ['WIT', 'Wipro', 'Software'],
  ['SIFY', 'Sify Technologies', 'Technology'], ['KB', 'KB Financial', 'Finance'],
  ['SHG', 'Shinhan Financial', 'Finance'], ['PKX', 'POSCO Holdings', 'Materials'],
  ['LPL', 'LG Display', 'Hardware'], ['ASX', 'ASE Technology', 'Semiconductors'],
  ['UMC', 'United Microelectronics', 'Semiconductors'], ['CHT', 'Chunghwa Telecom', 'Telecom'],
  ['SE', 'Sea Limited', 'Technology'], ['GRAB', 'Grab Holdings', 'Technology'],
  ['MELI', 'MercadoLibre', 'Technology'], ['CPNG', 'Coupang', 'Retail'],
  ['VIPS', 'Vipshop', 'Retail'], ['WB', 'Weibo', 'Media'],
  ['GDS', 'GDS Holdings', 'Technology'], ['ATHM', 'Autohome', 'Media'],
  ['TME', 'Tencent Music', 'Media'], ['QFIN', 'Qifu Technology', 'FinTech'],
  ['YNDX', 'Yandex', 'Technology'], ['MMYT', 'MakeMyTrip', 'Travel'],
];

const LATAM_STOCKS = [
  ['VALE', 'Vale', 'Materials'], ['PBR', 'Petrobras', 'Energy'],
  ['ITUB', 'Itaú Unibanco', 'Finance'], ['BBD', 'Banco Bradesco', 'Finance'],
  ['ABEV', 'Ambev', 'Beverages'], ['ERJ', 'Embraer', 'Industrials'],
  ['GGB', 'Gerdau', 'Materials'], ['SBS', 'Sabesp', 'Utilities'],
  ['CIG', 'Cemig', 'Utilities'], ['ELP', 'Copel', 'Utilities'],
  ['UGP', 'Ultrapar', 'Energy'], ['NU', 'Nu Holdings', 'FinTech'],
  ['PAGS', 'PagSeguro', 'FinTech'], ['STNE', 'StoneCo', 'FinTech'],
  ['VIV', 'Telefônica Brasil', 'Telecom'], ['TIMB', 'TIM Brasil', 'Telecom'],
  ['SUZ', 'Suzano', 'Materials'], ['CBD', 'Companhia Brasileira de Distribuição', 'Retail'],
  ['MELI', 'MercadoLibre', 'Technology'], ['GLOB', 'Globant', 'Software'],
  ['YPF', 'YPF', 'Energy'], ['PAM', 'Pampa Energía', 'Utilities'],
  ['TGS', 'Transportadora Gas del Sur', 'Energy'], ['BBAR', 'BBVA Argentina', 'Finance'],
  ['GGAL', 'Grupo Galicia', 'Finance'], ['BMA', 'Banco Macro', 'Finance'],
  ['ARCO', 'Arcos Dorados', 'Restaurant'], ['FMX', 'FEMSA', 'Beverages'],
  ['KOF', 'Coca-Cola FEMSA', 'Beverages'], ['AMX', 'América Móvil', 'Telecom'],
  ['TV', 'Grupo Televisa', 'Media'], ['CX', 'Cemex', 'Materials'],
  ['OMAB', 'Grupo Aeroportuario Centro Norte', 'Industrials'],
  ['PAC', 'Grupo Aeroportuario del Pacífico', 'Industrials'],
  ['ASR', 'Grupo Aeroportuario del Sureste', 'Industrials'],
];

const AFRICA_STOCKS = [
  ['SSL', 'Sasol', 'Energy'], ['GFI', 'Gold Fields', 'Materials'],
  ['AU', 'AngloGold Ashanti', 'Materials'], ['HMY', 'Harmony Gold', 'Materials'],
  ['SBSW', 'Sibanye-Stillwater', 'Materials'], ['IMP', 'Impala Platinum', 'Materials'],
  ['NPSNY', 'Naspers', 'Technology'], ['MTNOY', 'MTN Group', 'Telecom'],
  ['SBKJY', 'Standard Bank', 'Finance'],
];

// ── ETFs: broad indices, regions, sectors, commodities, themes ──────────────
const ETFS = [
  ['SPY', 'S&P 500 ETF', 'Index', 'US'], ['QQQ', 'Nasdaq 100 ETF', 'Index', 'US'],
  ['DIA', 'Dow Jones ETF', 'Index', 'US'], ['IWM', 'Russell 2000 ETF', 'Index', 'US'],
  ['VOO', 'Vanguard S&P 500', 'Index', 'US'], ['VTI', 'Vanguard Total Market', 'Index', 'US'],
  ['SCHB', 'Schwab US Broad', 'Index', 'US'], ['SCHD', 'Schwab Dividend', 'Dividend', 'US'],
  ['XLK', 'Technology Select', 'Technology', 'US'], ['XLF', 'Financials Select', 'Finance', 'US'],
  ['XLE', 'Energy Select', 'Energy', 'US'], ['XLV', 'Healthcare Select', 'Healthcare', 'US'],
  ['XLY', 'Consumer Discretionary Select', 'Consumer', 'US'],
  ['XLP', 'Consumer Staples Select', 'Consumer', 'US'],
  ['XLI', 'Industrials Select', 'Industrials', 'US'], ['XLU', 'Utilities Select', 'Utilities', 'US'],
  ['XLB', 'Materials Select', 'Materials', 'US'], ['XLRE', 'Real Estate Select', 'Real Estate', 'US'],
  ['TLT', '20+ Year Treasury', 'Fixed Income', 'US'], ['IEF', '7-10 Year Treasury', 'Fixed Income', 'US'],
  ['SHY', '1-3 Year Treasury', 'Fixed Income', 'US'], ['HYG', 'High Yield Corporate', 'Fixed Income', 'US'],
  ['LQD', 'Investment Grade Corporate', 'Fixed Income', 'US'],
  ['ARKK', 'ARK Innovation', 'Growth', 'US'], ['ARKF', 'ARK FinTech', 'FinTech', 'US'],
  ['ARKW', 'ARK Next Gen Internet', 'Technology', 'US'], ['SMH', 'Semiconductor ETF', 'Semiconductors', 'US'],
  ['XBI', 'Biotech ETF', 'Healthcare', 'US'], ['IBB', 'Nasdaq Biotechnology', 'Healthcare', 'US'],
  ['VNQ', 'Real Estate ETF', 'Real Estate', 'US'], ['GLD', 'Gold Trust', 'Commodities', 'Global'],
  ['SLV', 'Silver Trust', 'Commodities', 'Global'], ['USO', 'US Oil Fund', 'Energy', 'Global'],
  ['UNG', 'US Natural Gas Fund', 'Energy', 'Global'], ['CPER', 'Copper Index', 'Materials', 'Global'],
  ['PPLT', 'Physical Platinum', 'Materials', 'Global'], ['LIT', 'Lithium & Battery Tech', 'Materials', 'Global'],
  ['URA', 'Uranium ETF', 'Energy', 'Global'], ['WEAT', 'Wheat Fund', 'Agriculture', 'Global'],
  ['CORN', 'Corn Fund', 'Agriculture', 'Global'], ['DBA', 'Agriculture Fund', 'Agriculture', 'Global'],
  // Global / regional
  ['VEA', 'Developed Markets ex-US', 'Global Equity', 'Global'],
  ['VWO', 'Emerging Markets', 'Global Equity', 'Global'],
  ['EFA', 'MSCI EAFE', 'Global Equity', 'Global'], ['EEM', 'MSCI Emerging Markets', 'Global Equity', 'Global'],
  ['ACWI', 'MSCI All Country World', 'Global Equity', 'Global'],
  ['EWG', 'Germany ETF', 'Europe Equity', 'Europe'], ['EWU', 'United Kingdom ETF', 'Europe Equity', 'Europe'],
  ['EWQ', 'France ETF', 'Europe Equity', 'Europe'], ['EWD', 'Sweden ETF', 'Europe Equity', 'Europe'],
  ['EWI', 'Italy ETF', 'Europe Equity', 'Europe'], ['EWP', 'Spain ETF', 'Europe Equity', 'Europe'],
  ['EWN', 'Netherlands ETF', 'Europe Equity', 'Europe'], ['EWL', 'Switzerland ETF', 'Europe Equity', 'Europe'],
  ['EWJ', 'Japan ETF', 'Asia Equity', 'Asia'], ['FXI', 'China Large Cap ETF', 'Asia Equity', 'Asia'],
  ['MCHI', 'MSCI China ETF', 'Asia Equity', 'Asia'], ['INDA', 'India ETF', 'Asia Equity', 'Asia'],
  ['EWY', 'South Korea ETF', 'Asia Equity', 'Asia'], ['EWT', 'Taiwan ETF', 'Asia Equity', 'Asia'],
  ['EWH', 'Hong Kong ETF', 'Asia Equity', 'Asia'], ['ASHR', 'CSI 300 China A-Shares', 'Asia Equity', 'Asia'],
  ['EWZ', 'Brazil ETF', 'LatAm Equity', 'Latin America'], ['EWW', 'Mexico ETF', 'LatAm Equity', 'Latin America'],
  ['ARGT', 'Argentina ETF', 'LatAm Equity', 'Latin America'], ['ECH', 'Chile ETF', 'LatAm Equity', 'Latin America'],
  ['EPU', 'Peru ETF', 'LatAm Equity', 'Latin America'], ['GXG', 'Colombia ETF', 'LatAm Equity', 'Latin America'],
  ['EZA', 'South Africa ETF', 'Africa Equity', 'Africa'],
  ['NGE', 'Nigeria ETF', 'Africa Equity', 'Africa'], ['KSA', 'Saudi Arabia ETF', 'Middle East Equity', 'Global'],
  ['TUR', 'Turkey ETF', 'Global Equity', 'Global'], ['EIS', 'Israel ETF', 'Global Equity', 'Global'],
  ['EWC', 'Canada ETF', 'Global Equity', 'Global'], ['EWA', 'Australia ETF', 'Global Equity', 'Global'],
  ['EWS', 'Singapore ETF', 'Asia Equity', 'Asia'], ['EPHE', 'Philippines ETF', 'Asia Equity', 'Asia'],
  ['THD', 'Thailand ETF', 'Asia Equity', 'Asia'], ['EIDO', 'Indonesia ETF', 'Asia Equity', 'Asia'],
  ['VNM', 'Vietnam ETF', 'Asia Equity', 'Asia'], ['EPOL', 'Poland ETF', 'Europe Equity', 'Europe'],
  ['GREK', 'Greece ETF', 'Europe Equity', 'Europe'], ['VGK', 'FTSE Europe ETF', 'Europe Equity', 'Europe'],
  ['IEV', 'Europe 350 ETF', 'Europe Equity', 'Europe'], ['ILF', 'Latin America 40 ETF', 'LatAm Equity', 'Latin America'],
];

// ── COMMODITIES: spot/futures proxies the app can quote ─────────────────────
// `instrument` states plainly what is being quoted — an ETF proxy is never
// presented as the spot price.
const COMMODITIES = [
  ['GLD', 'Gold (ETF proxy)', 'Precious Metal', 'Global', 'ETF · GLD'],
  ['SLV', 'Silver (ETF proxy)', 'Precious Metal', 'Global', 'ETF · SLV'],
  ['USO', 'Crude Oil WTI (ETF proxy)', 'Energy', 'Global', 'ETF · USO'],
  ['UNG', 'Natural Gas (ETF proxy)', 'Energy', 'Global', 'ETF · UNG'],
  ['CPER', 'Copper (ETF proxy)', 'Industrial Metal', 'Global', 'ETF · CPER'],
  ['PPLT', 'Platinum (ETF proxy)', 'Precious Metal', 'Global', 'ETF · PPLT'],
  ['LIT', 'Lithium & Battery (ETF proxy)', 'Industrial Metal', 'Global', 'ETF · LIT'],
  ['URA', 'Uranium (ETF proxy)', 'Energy', 'Global', 'ETF · URA'],
  ['WEAT', 'Wheat (ETF proxy)', 'Agriculture', 'Global', 'ETF · WEAT'],
  ['CORN', 'Corn (ETF proxy)', 'Agriculture', 'Global', 'ETF · CORN'],
];

// ── FOREX ──────────────────────────────────────────────────────────────────
const FOREX = [
  ['EURUSD', 'EUR/USD', 'Major', 'Global'], ['GBPUSD', 'GBP/USD', 'Major', 'Global'],
  ['USDJPY', 'USD/JPY', 'Major', 'Global'], ['USDCHF', 'USD/CHF', 'Major', 'Global'],
  ['AUDUSD', 'AUD/USD', 'Major', 'Global'], ['USDCAD', 'USD/CAD', 'Major', 'Global'],
  ['NZDUSD', 'NZD/USD', 'Major', 'Global'], ['USDSEK', 'USD/SEK', 'Scandinavian', 'Europe'],
  ['EURSEK', 'EUR/SEK', 'Scandinavian', 'Europe'], ['USDCNH', 'USD/CNH', 'Asia', 'Asia'],
  ['USDMXN', 'USD/MXN', 'LatAm', 'Latin America'], ['USDBRL', 'USD/BRL', 'LatAm', 'Latin America'],
  ['USDZAR', 'USD/ZAR', 'Africa', 'Africa'], ['USDTRY', 'USD/TRY', 'EMEA', 'Global'],
  ['USDINR', 'USD/INR', 'Asia', 'Asia'],
];

// ── CRYPTO: the liquid top of the market-cap table ─────────────────────────
const CRYPTO = [
  ['BTC', 'Bitcoin'], ['ETH', 'Ethereum'], ['BNB', 'BNB'], ['SOL', 'Solana'],
  ['XRP', 'XRP'], ['DOGE', 'Dogecoin'], ['ADA', 'Cardano'], ['TRX', 'TRON'],
  ['AVAX', 'Avalanche'], ['LINK', 'Chainlink'], ['TON', 'Toncoin'], ['SHIB', 'Shiba Inu'],
  ['DOT', 'Polkadot'], ['BCH', 'Bitcoin Cash'], ['NEAR', 'NEAR Protocol'], ['LTC', 'Litecoin'],
  ['UNI', 'Uniswap'], ['ICP', 'Internet Computer'], ['APT', 'Aptos'], ['ATOM', 'Cosmos'],
  ['XLM', 'Stellar'], ['ARB', 'Arbitrum'], ['FIL', 'Filecoin'], ['VET', 'VeChain'],
  ['MKR', 'Maker'], ['OP', 'Optimism'], ['STX', 'Stacks'], ['IMX', 'Immutable'],
  ['INJ', 'Injective'], ['GRT', 'The Graph'], ['THETA', 'Theta Network'], ['LDO', 'Lido DAO'],
  ['RUNE', 'THORChain'], ['ALGO', 'Algorand'], ['EGLD', 'MultiversX'], ['AAVE', 'Aave'],
  ['SAND', 'The Sandbox'], ['MANA', 'Decentraland'], ['AXS', 'Axie Infinity'], ['FLOW', 'Flow'],
  ['XTZ', 'Tezos'], ['EOS', 'EOS'], ['GALA', 'Gala'], ['NEO', 'NEO'],
  ['QNT', 'Quant'], ['CHZ', 'Chiliz'], ['KAVA', 'Kava'], ['ZEC', 'Zcash'],
  ['DASH', 'Dash'], ['COMP', 'Compound'], ['SNX', 'Synthetix'], ['CRV', 'Curve DAO'],
  ['ENJ', 'Enjin'], ['BAT', 'Basic Attention'], ['1INCH', '1inch'], ['YFI', 'yearn.finance'],
  ['SUSHI', 'SushiSwap'], ['UMA', 'UMA'], ['ZRX', '0x'], ['BAL', 'Balancer'],
  ['KNC', 'Kyber Network'], ['ANKR', 'Ankr'], ['CELO', 'Celo'], ['ICX', 'ICON'],
  ['ZIL', 'Zilliqa'], ['KSM', 'Kusama'], ['AR', 'Arweave'], ['ROSE', 'Oasis Network'],
  ['JASMY', 'JasmyCoin'], ['MASK', 'Mask Network'], ['DYDX', 'dYdX'], ['GMX', 'GMX'],
  ['PENDLE', 'Pendle'], ['BLUR', 'Blur'], ['SEI', 'Sei'], ['SUI', 'Sui'],
  ['TIA', 'Celestia'], ['JUP', 'Jupiter'], ['PYTH', 'Pyth Network'], ['WIF', 'dogwifhat'],
  ['BONK', 'Bonk'], ['FLOKI', 'FLOKI'], ['PEPE', 'Pepe'], ['ORDI', 'ORDI'],
  ['ASTR', 'Astar'], ['GLMR', 'Moonbeam'], ['CFG', 'Centrifuge'], ['PHA', 'Phala Network'],
  ['CTSI', 'Cartesi'], ['LRC', 'Loopring'], ['SKL', 'SKALE'], ['STORJ', 'Storj'],
  ['SC', 'Siacoin'], ['DGB', 'DigiByte'], ['RVN', 'Ravencoin'], ['IOTA', 'IOTA'],
  ['HBAR', 'Hedera'], ['XDC', 'XDC Network'], ['CSPR', 'Casper'], ['ONE', 'Harmony'],
  ['QTUM', 'Qtum'], ['ONT', 'Ontology'], ['WAVES', 'Waves'], ['OCEAN', 'Ocean Protocol'],
  ['REN', 'Ren'], ['TLM', 'Alien Worlds'], ['DENT', 'Dent'], ['HOT', 'Holo'],
  ['BTT', 'BitTorrent'], ['WIN', 'WINkLink'], ['CKB', 'Nervos Network'], ['KAS', 'Kaspa'],
  ['RNDR', 'Render'], ['TAO', 'Bittensor'], ['FET', 'Fetch.ai'], ['AGIX', 'SingularityNET'],
  ['AKT', 'Akash Network'], ['NTRN', 'Neutron'], ['OSMO', 'Osmosis'], ['AXL', 'Axelar'],
  ['WOO', 'WOO Network'], ['MAGIC', 'Magic'], ['ID', 'SPACE ID'], ['ARKM', 'Arkham'],
  ['WLD', 'Worldcoin'], ['EDU', 'Open Campus'], ['ETHFI', 'Ether.fi'], ['ENA', 'Ethena'],
  ['ONDO', 'Ondo'], ['JTO', 'Jito'], ['STRK', 'Starknet'], ['DYM', 'Dymension'],
  ['ALT', 'AltLayer'], ['MANTA', 'Manta Network'], ['ZK', 'zkSync'], ['ZRO', 'LayerZero'],
  ['TNSR', 'Tensor'], ['REZ', 'Renzo'], ['BLAST', 'Blast'], ['IO', 'io.net'],
  ['ZETA', 'ZetaChain'], ['MEW', 'cat in a dogs world'], ['NOT', 'Notcoin'], ['DOGS', 'DOGS'],
  ['HMSTR', 'Hamster Kombat'], ['NEIRO', 'Neiro'], ['GOAT', 'Goatseus Maximus'], ['PNUT', 'Peanut the Squirrel'],
  ['BOME', 'Book of Meme'], ['MYRO', 'Myro'], ['POPCAT', 'Popcat'], ['MOG', 'Mog Coin'],
  ['TURBO', 'Turbo'], ['LADYS', 'Milady'], ['MATIC', 'Polygon'], ['SUSDE', 'Ethena USDe'],
];

const row = (type, region, [symbol, name, sector, regionOverride, instrument]) => ({
  symbol,
  name,
  type,
  sector,
  region: regionOverride || region,
  ...(instrument ? { instrument } : {}),
});

const usStocks = US_STOCKS.map((r) => row('stock', 'US', r));
const europeStocks = EUROPE_STOCKS.map((r) => row('stock', 'Europe', r));
const asiaStocks = ASIA_STOCKS.map((r) => row('stock', 'Asia', r));
const latamStocks = LATAM_STOCKS.map((r) => row('stock', 'Latin America', r));
const africaStocks = AFRICA_STOCKS.map((r) => row('stock', 'Africa', r));
const etfs = ETFS.map((r) => row('etf', 'Global', r));
const commodities = COMMODITIES.map((r) => row('commodity', 'Global', r));
const forex = FOREX.map((r) => row('forex', 'Global', r));
const crypto = CRYPTO.map((r) => row('crypto', 'Global', r));

// ── COMBINED UNIVERSE (de-duplicated: the first entry for a symbol wins) ────
const dedupe = (list) => {
  const seen = new Set();
  return list.filter((a) => {
    const key = a.symbol.toUpperCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const UNIVERSE = dedupe([
  ...usStocks, ...europeStocks, ...asiaStocks, ...latamStocks, ...africaStocks,
  ...etfs, ...commodities, ...forex, ...crypto,
]);

export const ALL_ASSETS = UNIVERSE;

// ── LEGACY EXPORTS (kept so existing callers keep working) ──────────────────
export const TIER1_ASSETS = UNIVERSE.filter((a) => ['AAPL', 'NVDA', 'TSLA', 'AMZN', 'SPY', 'QQQ', 'BTC', 'ETH'].includes(a.symbol));
export const TIER3_STOCKS = UNIVERSE.filter((a) => a.type === 'stock');
export const TIER3_ETFS = UNIVERSE.filter((a) => a.type === 'etf');
export const TIER3_CRYPTO = UNIVERSE.filter((a) => a.type === 'crypto');
export const TIER3_ALL = [...TIER3_STOCKS, ...TIER3_ETFS, ...TIER3_CRYPTO];

// ── LOOKUPS ────────────────────────────────────────────────────────────────
const assetMap = new Map();
UNIVERSE.forEach((asset) => assetMap.set(asset.symbol.toUpperCase(), asset));

export const getAsset = (symbol) => assetMap.get(String(symbol || '').toUpperCase());

export const searchAssets = (query) => {
  const q = String(query || '').trim().toUpperCase();
  if (!q) return [];
  return UNIVERSE.filter(
    (asset) => asset.symbol.includes(q) || asset.name.toUpperCase().includes(q),
  );
};

export const getUniverseByRegion = (region) =>
  !region || region === 'All' ? UNIVERSE : UNIVERSE.filter((a) => a.region === region);

export const getAssetClass = (symbol) => getAsset(symbol)?.type || 'unknown';

export const getProviderForAsset = (symbol) => (getAssetClass(symbol) === 'crypto' ? 'coingecko' : 'polygon');

export const getUniverseStats = () => ({
  totalSupported: UNIVERSE.length,
  breakdown: {
    usStocks: usStocks.length,
    europeStocks: europeStocks.length,
    asiaStocks: asiaStocks.length,
    latamStocks: latamStocks.length,
    africaStocks: africaStocks.length,
    etfs: etfs.length,
    commodities: commodities.length,
    forex: forex.length,
    crypto: crypto.length,
  },
});

export default {
  UNIVERSE,
  ALL_ASSETS,
  REGION_IDS,
  DEFAULT_REGION,
  TIER1_ASSETS,
  TIER3_STOCKS,
  TIER3_ETFS,
  TIER3_CRYPTO,
  TIER3_ALL,
  getAsset,
  searchAssets,
  getUniverseByRegion,
  getAssetClass,
  getProviderForAsset,
  getUniverseStats,
};