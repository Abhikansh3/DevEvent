
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventsPage = async () => {
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();

  return (
    <section>
      <h1 className="text-center">All Events</h1>
      <p className="text-center mt-5">Browse all upcoming developer events</p>

      <div className="mt-10 space-y-7">
        <ul className="events">
          {events && events.length > 0 ? (
            events.map((event: IEvent) => (
              <li key={event.slug} className="list-none">
                <EventCard {...event} />
              </li>
            ))
          ) : (
            <p className="text-center text-gray-400">No events found.</p>
          )}
        </ul>
      </div>
    </section>
  );
};

export default EventsPage;

