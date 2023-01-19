import {
  Button,
  Card,
  Checkbox,
  Col,
  Grid,
  Image,
  Loading,
  Row,
  Spacer,
  Text,
  Textarea,
} from "@nextui-org/react";
import { User } from "@supabase/supabase-js";
import { IconTrash, IconTrash2, Input } from "@supabase/ui";
import { useState, useEffect } from "react";
import { supabase } from "../lib/initSupabase";
import { Database } from "../types/schema";

type Todo = Database["public"]["Tables"]["todos"]["Row"];

export default function TodoList({ user }: { user: User }) {
  const [todos, setTodos] = useState<Todo[]>();
  const [newTaskText, setNewTaskText] = useState("");
  const [errorText, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("id");

      if (error) console.log("error", error);
      else setTodos(data || []);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (taskText: string) => {
    let task = taskText.trim();
    if (task.length > 0) {
      console.log(task);
      const { data } = await supabase
        .from("todos")
        .insert({ task: `　${task}`, user_id: user.id });

      await fetchTodos();
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await supabase.from("todos").delete().eq("id", id);
      let { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("id");

      setTodos(todos && todos.filter((x) => x.id != id));
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <h1>Todoリスト</h1>
          <Row justify="center" align="center">
            <Col />
            <Col>
              <Input
                color="secondary"
                placeholder="やること"
                value={newTaskText}
                onChange={(e) => {
                  setError("");
                  setNewTaskText(e.target.value);
                }}
              />
            </Col>
            <Col>
              <Button
                color="success"
                auto
                bordered
                borderWeight={"bold"}
                onClick={() => addTodo(newTaskText)}
              >
                <Text>新規追加</Text>
              </Button>
              {!!errorText && <Alert text={errorText} />}
            </Col>
          </Row>
          <div>
            <ul>
              {todos &&
                todos.map((todo) => (
                  <Todo
                    key={todo.id}
                    todo={todo}
                    onDelete={() => deleteTodo(todo.id)}
                  />
                ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

const Todo = ({ todo, onDelete }: { todo: Todo; onDelete: any }) => {
  const [isCompleted, setIsCompleted] = useState(todo.is_complete);

  const toggle = async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .update({ is_complete: !todo.is_complete })
        .eq("id", todo.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      setIsCompleted(!isCompleted);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
    >
      <div>
        <Spacer y={1} />
        <Card variant="bordered">
          <Card.Header>
            <Text h1 size={20} weight="bold">
              {todo.task}
            </Text>
          </Card.Header>
          <Card.Divider />
          <Card.Footer>
            <Grid.Container>
              <Grid md={8} />
              <Grid md={2}>
                <Checkbox
                  size="sm"
                  label="完了"
                  onChange={(e) => toggle()}
                  isSelected={isCompleted ? true : false}
                  color={"success"}
                >
                  完了
                </Checkbox>
              </Grid>
              <Grid md={2}>
                <Button
                  onClick={(e) => {
                    // e.preventDefault();
                    // e.stopPropagation();
                    onDelete();
                  }}
                  size="xs"
                  light
                  color="error"
                >
                  <Image src="/trash.png" width={20} height={20} />
                </Button>
              </Grid>
            </Grid.Container>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};

const Alert = ({ text }: { text: String }) => (
  <div>
    <div>{text}</div>
  </div>
);
