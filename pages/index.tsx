import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import {
  Session,
  useSession,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import Account from "../components/Account";
import TodoList from "../components/TodoList";
import { Tabs } from "@supabase/ui";

const Home = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  return (
    <div className="container" style={{ padding: "50px 300px" }}>
      {/* ログイン状態ではなかったら */}
      {!session?.user ? (
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      ) : (
        // ログインしていたら
        <Tabs type="underlined" size="large">
          <Tabs.Panel id="todo" label="Todoリスト">
            <TodoList user={session.user} />
          </Tabs.Panel>
          <Tabs.Panel id="account" label="アカウント情報">
            <Account session={session} />
          </Tabs.Panel>
        </Tabs>
      )}
    </div>
  );
};

export default Home;
