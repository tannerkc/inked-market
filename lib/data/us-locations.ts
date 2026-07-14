/**
 * US states + a starter set of cities (capital first, then major metros).
 * Powers the state/city dropdowns during signup. Intentionally not
 * exhaustive — expand or replace with a geo API as coverage grows.
 */

export interface StateLocation {
  /** USPS two-letter code, stored in the DB (e.g. "CA") */
  code: string;
  name: string;
  /** Capital first, then major cities */
  cities: string[];
}

export const US_STATES: StateLocation[] = [
  { code: "AL", name: "Alabama", cities: ["Montgomery", "Birmingham", "Huntsville", "Mobile", "Tuscaloosa"] },
  { code: "AK", name: "Alaska", cities: ["Juneau", "Anchorage", "Fairbanks"] },
  { code: "AZ", name: "Arizona", cities: ["Phoenix", "Tucson", "Mesa", "Scottsdale", "Tempe", "Flagstaff"] },
  { code: "AR", name: "Arkansas", cities: ["Little Rock", "Fayetteville", "Fort Smith", "Bentonville"] },
  { code: "CA", name: "California", cities: ["Sacramento", "Los Angeles", "San Diego", "San Francisco", "San Jose", "Fresno", "Long Beach", "Oakland", "Santa Ana", "Anaheim", "Riverside", "Bakersfield"] },
  { code: "CO", name: "Colorado", cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder"] },
  { code: "CT", name: "Connecticut", cities: ["Hartford", "Bridgeport", "New Haven", "Stamford", "Waterbury"] },
  { code: "DE", name: "Delaware", cities: ["Dover", "Wilmington", "Newark"] },
  { code: "DC", name: "District of Columbia", cities: ["Washington"] },
  { code: "FL", name: "Florida", cities: ["Tallahassee", "Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Fort Lauderdale", "Sarasota"] },
  { code: "GA", name: "Georgia", cities: ["Atlanta", "Savannah", "Augusta", "Columbus", "Athens", "Macon"] },
  { code: "HI", name: "Hawaii", cities: ["Honolulu", "Hilo", "Kailua"] },
  { code: "ID", name: "Idaho", cities: ["Boise", "Meridian", "Idaho Falls", "Coeur d'Alene"] },
  { code: "IL", name: "Illinois", cities: ["Springfield", "Chicago", "Aurora", "Naperville", "Rockford", "Peoria"] },
  { code: "IN", name: "Indiana", cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Bloomington"] },
  { code: "IA", name: "Iowa", cities: ["Des Moines", "Cedar Rapids", "Davenport", "Iowa City"] },
  { code: "KS", name: "Kansas", cities: ["Topeka", "Wichita", "Overland Park", "Kansas City", "Lawrence"] },
  { code: "KY", name: "Kentucky", cities: ["Frankfort", "Louisville", "Lexington", "Bowling Green"] },
  { code: "LA", name: "Louisiana", cities: ["Baton Rouge", "New Orleans", "Shreveport", "Lafayette"] },
  { code: "ME", name: "Maine", cities: ["Augusta", "Portland", "Bangor"] },
  { code: "MD", name: "Maryland", cities: ["Annapolis", "Baltimore", "Frederick", "Rockville"] },
  { code: "MA", name: "Massachusetts", cities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell"] },
  { code: "MI", name: "Michigan", cities: ["Lansing", "Detroit", "Grand Rapids", "Ann Arbor", "Flint", "Kalamazoo"] },
  { code: "MN", name: "Minnesota", cities: ["St. Paul", "Minneapolis", "Rochester", "Duluth"] },
  { code: "MS", name: "Mississippi", cities: ["Jackson", "Gulfport", "Hattiesburg", "Biloxi"] },
  { code: "MO", name: "Missouri", cities: ["Jefferson City", "Kansas City", "St. Louis", "Springfield", "Columbia"] },
  { code: "MT", name: "Montana", cities: ["Helena", "Billings", "Missoula", "Bozeman"] },
  { code: "NE", name: "Nebraska", cities: ["Lincoln", "Omaha", "Grand Island"] },
  { code: "NV", name: "Nevada", cities: ["Carson City", "Las Vegas", "Reno", "Henderson"] },
  { code: "NH", name: "New Hampshire", cities: ["Concord", "Manchester", "Nashua", "Portsmouth"] },
  { code: "NJ", name: "New Jersey", cities: ["Trenton", "Newark", "Jersey City", "Paterson", "Atlantic City"] },
  { code: "NM", name: "New Mexico", cities: ["Santa Fe", "Albuquerque", "Las Cruces"] },
  { code: "NY", name: "New York", cities: ["Albany", "New York", "Buffalo", "Rochester", "Syracuse", "Yonkers"] },
  { code: "NC", name: "North Carolina", cities: ["Raleigh", "Charlotte", "Greensboro", "Durham", "Winston-Salem", "Asheville", "Wilmington"] },
  { code: "ND", name: "North Dakota", cities: ["Bismarck", "Fargo", "Grand Forks"] },
  { code: "OH", name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton"] },
  { code: "OK", name: "Oklahoma", cities: ["Oklahoma City", "Tulsa", "Norman"] },
  { code: "OR", name: "Oregon", cities: ["Salem", "Portland", "Eugene", "Bend", "Medford"] },
  { code: "PA", name: "Pennsylvania", cities: ["Harrisburg", "Philadelphia", "Pittsburgh", "Allentown", "Erie", "Scranton"] },
  { code: "RI", name: "Rhode Island", cities: ["Providence", "Warwick", "Newport"] },
  { code: "SC", name: "South Carolina", cities: ["Columbia", "Charleston", "Greenville", "Myrtle Beach"] },
  { code: "SD", name: "South Dakota", cities: ["Pierre", "Sioux Falls", "Rapid City"] },
  { code: "TN", name: "Tennessee", cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga"] },
  { code: "TX", name: "Texas", cities: ["Austin", "Houston", "Dallas", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"] },
  { code: "UT", name: "Utah", cities: ["Salt Lake City", "Provo", "Ogden", "St. George"] },
  { code: "VT", name: "Vermont", cities: ["Montpelier", "Burlington"] },
  { code: "VA", name: "Virginia", cities: ["Richmond", "Virginia Beach", "Norfolk", "Arlington", "Alexandria", "Roanoke"] },
  { code: "WA", name: "Washington", cities: ["Olympia", "Seattle", "Spokane", "Tacoma", "Bellevue", "Vancouver"] },
  { code: "WV", name: "West Virginia", cities: ["Charleston", "Morgantown", "Huntington"] },
  { code: "WI", name: "Wisconsin", cities: ["Madison", "Milwaukee", "Green Bay", "Kenosha"] },
  { code: "WY", name: "Wyoming", cities: ["Cheyenne", "Casper", "Jackson"] },
];

export function citiesForState(code: string): string[] {
  return US_STATES.find((s) => s.code === code)?.cities ?? [];
}

export function isValidStateCode(code: string): boolean {
  return US_STATES.some((s) => s.code === code);
}

export function isValidCityForState(city: string, stateCode: string): boolean {
  return citiesForState(stateCode).includes(city);
}
