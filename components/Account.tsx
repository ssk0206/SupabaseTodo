import { useState, useEffect } from "react";
import {
  useUser,
  useSupabaseClient,
  Session,
} from "@supabase/auth-helpers-react";
import { Database } from "../types/schema";
import { Button, Container, Input, Grid, Spacer } from "@nextui-org/react";

type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

export default function Account({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<Profiles["username"]>(null);
  const [website, setWebsite] = useState<Profiles["website"]>(null);
  const [avatar_url, setAvatarUrl] = useState<Profiles["avatar_url"]>(null);

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!user) throw new Error("No user");

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("user_id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert("Error loading user data!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: Profiles["username"];
    website: Profiles["website"];
    avatar_url: Profiles["avatar_url"];
  }) {
    try {
      setLoading(true);
      if (!user) throw new Error("No user");

      const updates = {
        user_id: user.id,
        username: username,
        website: website,
        avatar_url: avatar_url,
        updated_at: new Date().toISOString(),
      };

      // let { error } = await supabase.from("profiles").upsert(updates).eq();
      const { data, error } = await supabase
        .from("profiles")
        .update({ username: updates.username, website: updates.website })
        .eq("user_id", updates.user_id)
        .single();

      if (error) throw error;
      // alert("Profile updated!");
      console.log(updates);
    } catch (error) {
      alert("Error updating the data!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container justify="center">
      <div>
        <Grid.Container justify="flex-end">
          <Grid>
            <Button
              color={"error"}
              bordered
              className="button block"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </Button>
          </Grid>
        </Grid.Container>
      </div>
      <Spacer y={4} />
      <div>
        <Grid.Container justify="center">
          <Grid>
            <Input
              label="Email"
              width="600px"
              bordered
              id="email"
              type="text"
              value={session.user.email}
              disabled
            />
          </Grid>
        </Grid.Container>
      </div>
      <Spacer></Spacer>
      <div>
        <Grid.Container justify="center">
          <Grid>
            <Input
              label="Username"
              width="600px"
              bordered
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>
        </Grid.Container>
      </div>
      <Spacer />
      <div>
        <Grid.Container justify="center">
          <Grid>
            <Input
              label="Website"
              width="600px"
              labelLeft
              bordered
              id="website"
              type="website"
              value={website || ""}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </Grid>
        </Grid.Container>
      </div>
      <Spacer y={3} />
      <div>
        <Grid.Container justify="center">
          <Grid>
            <Button
              bordered
              className="button primary block"
              onClick={() => updateProfile({ username, website, avatar_url })}
              disabled={loading}
              color={"success"}
              borderWeight={"bold"}
            >
              {loading ? "Loading ..." : "Update"}
            </Button>
          </Grid>
        </Grid.Container>
      </div>
      <Spacer />
    </Container>
  );
}
