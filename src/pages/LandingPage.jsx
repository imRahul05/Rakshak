import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
  MapIcon,
  BellAlertIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Real-time Incident Reporting',
    description: 'Report incidents instantly and get immediate response from nearby responders.',
    icon: BellAlertIcon,
  },
  {
    name: 'Live Location Tracking',
    description: 'Track incidents and responders in real-time with our interactive map interface.',
    icon: MapIcon,
  },
  {
    name: 'Community Support',
    description: 'Connect with your community and share important safety information.',
    icon: UserGroupIcon,
  },
  {
    name: 'Instant Communication',
    description: 'Real-time chat with responders and other community members during emergencies.',
    icon: ChatBubbleBottomCenterTextIcon,
  },
  {
    name: 'Quick Response',
    description: 'Get immediate assistance from verified emergency responders in your area.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Secure & Reliable',
    description: 'Your safety is our priority. All data is encrypted and securely stored.',
    icon: ShieldCheckIcon,
  },
];

const stats = [
  { value: '99%', label: 'Response Rate' },
  { value: '<2min', label: 'Average Response Time' },
  { value: '50k+', label: 'Active Users' },
  { value: '1M+', label: 'Incidents Resolved' },
];

const testimonials = [
  {
    content: "Rakshak has transformed how we handle emergencies. The real-time response system has saved countless lives in our community.",
    author: "Sarah Johnson",
    role: "Community Leader",
  },
  {
    content: "As a first responder, this platform has made our work incredibly efficient. The live tracking and instant communication features are game-changers.",
    author: "Michael Chen",
    role: "Emergency Responder",
  },
  {
    content: "The community features have brought us closer together and made our neighborhood safer than ever before.",
    author: "Priya Patel",
    role: "Resident",
  },
];

const LandingPage = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="bg-white">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <img className="h-8 w-auto" src="/logo.svg" alt="Rakshak" />
            </Link>
          </div>
          <div className="flex gap-x-12">
            <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
              Features
            </a>
            <a href="#testimonials" className="text-sm font-semibold leading-6 text-gray-900">
              Testimonials
            </a>
            <a href="#stats" className="text-sm font-semibold leading-6 text-gray-900">
              Impact
            </a>
          </div>
          <div className="flex flex-1 justify-end">
            {user ? (
              <Link
                to="/dashboard"
                className="text-sm font-semibold leading-6 text-primary-600"
              >
                Dashboard <span aria-hidden="true">&rarr;</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-primary-600"
              >
                Log in <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Your Community's Safety Guardian
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Empowering communities with real-time emergency response and coordination. 
                Join us in making your neighborhood safer, one alert at a time.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/register"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Get started
                </Link>
                <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="App screenshot"
                  className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Faster Response</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for community safety
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our comprehensive platform brings together emergency responders, community members, 
              and local authorities to create a safer environment for everyone.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="stats" className="bg-primary-600 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Trusted by communities worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-primary-100">
                We're making a difference in communities across the globe
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col bg-primary-700 p-8">
                  <dt className="text-sm font-semibold leading-6 text-primary-100">{stat.label}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-primary-600">
              Testimonials
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Hear from our community
            </p>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.author} className="pt-8 sm:inline-block sm:w-full sm:px-4">
                  <figure className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                    <blockquote className="text-gray-900">
                      <p>{`"${testimonial.content}"`}</p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-gray-600">{testimonial.role}</div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-primary-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to make your community safer?
                <br />
                Join Rakshak today.
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Start contributing to your community's safety. Sign up now and be part of the change.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <Link
                  to="/register"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Get started
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-white">
                  Sign in <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="relative mt-16 h-80 lg:mt-8">
              <img
                className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1776&q=80"
                alt="App screenshot"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
