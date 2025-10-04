"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    const content = window.prompt("What subscription or service do you want to cancel?");
    if (content) {
      client.models.Todo.create({
        content: content,
      });
    }
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Subscriptions to Cancel</h1>
        <p>Keep track of services and subscriptions you want to cancel.</p>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={createTodo}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          + Add Subscription to Cancel
        </button>
      </div>

      {todos.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((todo) => (
            <li 
              key={todo.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                margin: '0.5rem 0',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            >
              <span>{todo.content}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancelled ✓
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px dashed #dee2e6'
        }}>
          <p>No subscriptions to cancel yet!</p>
          <p>Add subscriptions that you want cancelled on time.</p>
        </div>
      )}
    </main>
  );
}
