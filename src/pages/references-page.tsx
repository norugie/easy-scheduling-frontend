import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type Community, type Location } from "@/lib/api";

export function ReferencesPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [locationForm, setLocationForm] = useState({
    name: "",
    timezone: "America/Vancouver",
  });
  const [communityForm, setCommunityForm] = useState({
    name: "",
    locationId: "",
  });
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const [nextLocations, nextCommunities] = await Promise.all([
        api.locations(),
        api.communities(),
      ]);
      setLocations(nextLocations);
      setCommunities(nextCommunities);
      setCommunityForm((current) => ({
        ...current,
        locationId: current.locationId || String(nextLocations[0]?.id ?? ""),
      }));
    } catch {
      setError("Could not load locations and communities.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const locationsById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations],
  );

  async function createLocation(event: React.FormEvent) {
    event.preventDefault();
    await api.createLocation(locationForm);
    setLocationForm({ name: "", timezone: "America/Vancouver" });
    await load();
  }

  async function createCommunity(event: React.FormEvent) {
    event.preventDefault();
    await api.createCommunity({
      name: communityForm.name,
      locationId: Number(communityForm.locationId),
    });
    setCommunityForm({ name: "", locationId: communityForm.locationId });
    await load();
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Reference data</p>
        <h2 className="text-2xl font-semibold">Locations and communities</h2>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="grid gap-3">
        <h3 className="text-lg font-semibold">Locations</h3>
        <form
          onSubmit={createLocation}
          className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
            placeholder="Location name"
            value={locationForm.name}
            onChange={(event) =>
              setLocationForm({ ...locationForm, name: event.target.value })
            }
            required
          />
          <input
            className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
            placeholder="Timezone"
            value={locationForm.timezone}
            onChange={(event) =>
              setLocationForm({ ...locationForm, timezone: event.target.value })
            }
            required
          />
          <Button type="submit">
            <Plus className="size-4" />
            Add
          </Button>
        </form>
        <div className="grid gap-2">
          {locations.map((location) => (
            <LocationRow key={location.id} location={location} onChange={load} />
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg font-semibold">Communities</h3>
        <form
          onSubmit={createCommunity}
          className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
            placeholder="Community name"
            value={communityForm.name}
            onChange={(event) =>
              setCommunityForm({ ...communityForm, name: event.target.value })
            }
            required
          />
          <select
            className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
            value={communityForm.locationId}
            onChange={(event) =>
              setCommunityForm({ ...communityForm, locationId: event.target.value })
            }
            required
          >
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={!locations.length}>
            <Plus className="size-4" />
            Add
          </Button>
        </form>
        <div className="grid gap-2">
          {communities.map((community) => (
            <CommunityRow
              key={community.id}
              community={community}
              locations={locations}
              locationName={locationsById.get(community.locationId)?.name ?? ""}
              onChange={load}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function LocationRow({
  location,
  onChange,
}: {
  location: Location;
  onChange: () => Promise<void>;
}) {
  const [draft, setDraft] = useState({
    name: location.name,
    timezone: location.timezone,
  });

  async function save() {
    await api.updateLocation(location.id, draft);
    await onChange();
  }

  async function remove() {
    await api.deleteLocation(location.id);
    await onChange();
  }

  return (
    <article className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.name}
        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.timezone}
        onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}
      />
      <RowActions onSave={save} onDelete={remove} />
    </article>
  );
}

function CommunityRow({
  community,
  locations,
  locationName,
  onChange,
}: {
  community: Community;
  locations: Location[];
  locationName: string;
  onChange: () => Promise<void>;
}) {
  const [draft, setDraft] = useState({
    name: community.name,
    locationId: String(community.locationId),
  });

  async function save() {
    await api.updateCommunity(community.id, {
      name: draft.name,
      locationId: Number(draft.locationId),
    });
    await onChange();
  }

  async function remove() {
    await api.deleteCommunity(community.id);
    await onChange();
  }

  return (
    <article className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.name}
        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
      />
      <select
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.locationId}
        onChange={(event) => setDraft({ ...draft, locationId: event.target.value })}
        title={locationName}
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
      <RowActions onSave={save} onDelete={remove} />
    </article>
  );
}

function RowActions({
  onSave,
  onDelete,
}: {
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onSave}>
        <Save className="size-4" />
        Save
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onDelete}>
        <Trash2 className="size-4" />
        Delete
      </Button>
    </div>
  );
}
