/**
 * Mock Data Adapter for local development/testing
 */

import type { DataAdapter, Location } from '../types';

// Sample mock locations for testing
const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Central Park Handcycle Rental',
    latitude: 40.785091,
    longitude: -73.968285,
    category: 'rental',
    description: 'Premier handcycle rental facility in Central Park. Offering a wide variety of adaptive bikes and expert staff to help you get started.',
    address: {
      street: '1 Central Park West',
      city: 'New York',
      state: 'NY',
      zip: '10023',
    },
    contact: {
      phone: '(212) 555-0123',
      email: 'info@cprental.com',
      website: 'https://example.com',
    },
    hours: 'Mon-Sun: 8am-8pm',
    url: 'https://example.com/central-park',
  },
  {
    id: '2',
    name: 'Golden Gate Trail',
    latitude: 37.8199,
    longitude: -122.4783,
    category: 'trail',
    description: 'Accessible paved trail with stunning views of the Golden Gate Bridge. Perfect for handcyclists of all skill levels.',
    address: {
      city: 'San Francisco',
      state: 'CA',
    },
    hours: 'Dawn to Dusk',
  },
  {
    id: '3',
    name: 'John Smith - Ambassador',
    latitude: 34.0522,
    longitude: -118.2437,
    category: 'ambassador',
    description: 'Paralympic athlete and handcycling advocate. Available for mentoring and group rides in the LA area.',
    address: {
      city: 'Los Angeles',
      state: 'CA',
      zip: '90012',
    },
    contact: {
      email: 'john@example.com',
    },
  },
  {
    id: '4',
    name: 'Lake Michigan Shore Path',
    latitude: 41.8781,
    longitude: -87.6298,
    category: 'trail',
    description: 'Beautiful lakefront trail stretching 18 miles. Fully accessible with rest stops and water fountains.',
    address: {
      city: 'Chicago',
      state: 'IL',
    },
  },
  {
    id: '5',
    name: 'Adaptive Sports Center',
    latitude: 39.7392,
    longitude: -104.9903,
    category: 'rental',
    description: 'Full-service adaptive sports facility with handcycle rentals, lessons, and guided tours.',
    address: {
      street: '1234 Sports Blvd',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
    },
    contact: {
      phone: '(303) 555-0199',
      email: 'contact@adaptivesports.com',
      website: 'https://example.com',
    },
    hours: 'Mon-Fri: 9am-6pm, Sat-Sun: 8am-8pm',
    url: 'https://example.com/denver',
    images: ['https://via.placeholder.com/400x300'],
  },
  {
    id: '6',
    name: 'Sarah Johnson - Ambassador',
    latitude: 47.6062,
    longitude: -122.3321,
    category: 'ambassador',
    description: 'Handcycling enthusiast and accessibility advocate. Organizes weekly group rides.',
    address: {
      city: 'Seattle',
      state: 'WA',
    },
    contact: {
      email: 'sarah@example.com',
    },
  },
  {
    id: '7',
    name: 'Freedom Trail',
    latitude: 42.3601,
    longitude: -71.0589,
    category: 'trail',
    description: 'Historic accessible trail through downtown. Well-maintained paths and scenic views.',
    address: {
      city: 'Boston',
      state: 'MA',
    },
  },
  {
    id: '8',
    name: 'Sunshine Adaptive Equipment',
    latitude: 25.7617,
    longitude: -80.1918,
    category: 'rental',
    description: 'Beach-friendly handcycles and adaptive equipment. Specializing in coastal terrain.',
    address: {
      street: '500 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zip: '33139',
    },
    contact: {
      phone: '(305) 555-0167',
      website: 'https://example.com',
    },
    hours: 'Daily: 7am-7pm',
  },
  // Nashville area locations
  {
    id: '9',
    name: 'Music City Adaptive Sports',
    latitude: 36.1627,
    longitude: -86.7816,
    category: 'rental',
    description: 'Premier adaptive cycling rental facility in downtown Nashville. Full range of handcycles and adaptive equipment.',
    address: {
      street: '123 Broadway',
      city: 'Nashville',
      state: 'TN',
      zip: '37203',
    },
    contact: {
      phone: '(615) 555-0100',
      email: 'info@musiccityadaptive.com',
      website: 'https://example.com',
    },
    hours: 'Mon-Sat: 8am-7pm, Sun: 10am-5pm',
  },
  {
    id: '10',
    name: 'Cumberland River Greenway',
    latitude: 36.1547,
    longitude: -86.7689,
    category: 'trail',
    description: 'Scenic 8-mile paved trail along the Cumberland River. Completely accessible with rest areas and scenic overlooks.',
    address: {
      city: 'Nashville',
      state: 'TN',
    },
    hours: 'Dawn to Dusk',
  },
  {
    id: '11',
    name: 'Michael Roberts - Ambassador',
    latitude: 36.1823,
    longitude: -86.7967,
    category: 'ambassador',
    description: 'Nashville-based Paralympic handcyclist and community advocate. Hosts monthly group rides and training sessions.',
    address: {
      city: 'Nashville',
      state: 'TN',
      zip: '37209',
    },
    contact: {
      email: 'michael@example.com',
    },
  },
  {
    id: '12',
    name: 'Percy Warner Park Trail',
    latitude: 36.0655,
    longitude: -86.8683,
    category: 'trail',
    description: '10+ miles of accessible paved trails through beautiful parkland. Perfect for all skill levels.',
    address: {
      city: 'Nashville',
      state: 'TN',
    },
  },
  // Denver area locations
  {
    id: '13',
    name: 'Rocky Mountain Handcycle Center',
    latitude: 39.7294,
    longitude: -104.8319,
    category: 'rental',
    description: 'Specialized high-altitude adaptive cycling equipment. Expert guides for mountain trails.',
    address: {
      street: '789 16th Street',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
    },
    contact: {
      phone: '(303) 555-0200',
      email: 'contact@rmhandcycle.com',
      website: 'https://example.com',
    },
    hours: 'Daily: 7am-8pm',
  },
  {
    id: '14',
    name: 'Cherry Creek Trail',
    latitude: 39.7472,
    longitude: -104.9511,
    category: 'trail',
    description: '40-mile paved trail system perfect for handcycling. Connects downtown Denver to suburbs.',
    address: {
      city: 'Denver',
      state: 'CO',
    },
  },
  {
    id: '15',
    name: 'Lisa Martinez - Ambassador',
    latitude: 39.7618,
    longitude: -104.8806,
    category: 'ambassador',
    description: 'Veteran adaptive athlete and coach. Specializes in helping beginners get started with handcycling.',
    address: {
      city: 'Denver',
      state: 'CO',
      zip: '80230',
    },
    contact: {
      email: 'lisa@example.com',
    },
  },
  {
    id: '16',
    name: 'South Platte River Trail',
    latitude: 39.7547,
    longitude: -105.0067,
    category: 'trail',
    description: 'Scenic riverside trail with mountain views. Fully accessible with regular rest areas.',
    address: {
      city: 'Denver',
      state: 'CO',
    },
    hours: 'Dawn to Dusk',
  },
  // San Jose area locations
  {
    id: '17',
    name: 'Silicon Valley Adaptive Cycling',
    latitude: 37.3382,
    longitude: -121.8863,
    category: 'rental',
    description: 'Cutting-edge adaptive cycling equipment and technology. Serving the entire Bay Area.',
    address: {
      street: '456 San Carlos Street',
      city: 'San Jose',
      state: 'CA',
      zip: '95110',
    },
    contact: {
      phone: '(408) 555-0300',
      email: 'info@svadaptive.com',
      website: 'https://example.com',
    },
    hours: 'Mon-Fri: 9am-6pm, Sat-Sun: 8am-7pm',
  },
  {
    id: '18',
    name: 'Los Gatos Creek Trail',
    latitude: 37.2358,
    longitude: -121.9623,
    category: 'trail',
    description: 'Beautiful 9.7-mile paved trail through urban and natural areas. Completely accessible.',
    address: {
      city: 'San Jose',
      state: 'CA',
    },
  },
  {
    id: '19',
    name: 'David Chen - Ambassador',
    latitude: 37.3541,
    longitude: -121.9552,
    category: 'ambassador',
    description: 'Tech industry professional and handcycling enthusiast. Organizes weekend group rides throughout Silicon Valley.',
    address: {
      city: 'San Jose',
      state: 'CA',
      zip: '95126',
    },
    contact: {
      email: 'david@example.com',
    },
  },
  {
    id: '20',
    name: 'Guadalupe River Trail',
    latitude: 37.3352,
    longitude: -121.8900,
    category: 'trail',
    description: 'Urban trail system connecting parks and neighborhoods. Great for beginners and families.',
    address: {
      city: 'San Jose',
      state: 'CA',
    },
    hours: 'Dawn to Dusk',
  },
  // Additional scattered locations for variety
  {
    id: '21',
    name: 'Portland Adaptive Adventures',
    latitude: 45.5152,
    longitude: -122.6784,
    category: 'rental',
    description: 'Community-focused adaptive sports center with handcycle rentals and group programs.',
    address: {
      street: '321 SW Morrison',
      city: 'Portland',
      state: 'OR',
      zip: '97204',
    },
    contact: {
      phone: '(503) 555-0400',
      website: 'https://example.com',
    },
    hours: 'Tue-Sun: 10am-6pm',
  },
  {
    id: '22',
    name: 'Austin Trail Riders',
    latitude: 30.2672,
    longitude: -97.7431,
    category: 'ambassador',
    description: 'Volunteer-run organization promoting accessible cycling in Austin and Central Texas.',
    address: {
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    contact: {
      email: 'info@austintrailriders.com',
    },
  },
  {
    id: '23',
    name: 'Minneapolis Chain of Lakes',
    latitude: 44.9537,
    longitude: -93.3122,
    category: 'trail',
    description: 'Network of accessible trails connecting beautiful urban lakes. 13+ miles of paved paths.',
    address: {
      city: 'Minneapolis',
      state: 'MN',
    },
  },
  {
    id: '24',
    name: 'Phoenix Desert Wheels',
    latitude: 33.4484,
    longitude: -112.0740,
    category: 'rental',
    description: 'Specialized desert terrain handcycles. Expert guidance for desert trail riding.',
    address: {
      street: '890 N Central Ave',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85004',
    },
    contact: {
      phone: '(602) 555-0500',
      email: 'info@desertwheel.com',
    },
    hours: 'Daily: 6am-7pm (seasonal hours)',
  },
];

export class MockDataAdapter implements DataAdapter {
  async fetchLocations(): Promise<Location[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`🎭 Using MOCK data for development (${mockLocations.length} locations)`);
    return mockLocations;
  }

  validateSchema(data: Location[]): Location[] {
    return data;
  }
}
