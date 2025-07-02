# 🎯 Navigation Properties with Lazy Loading

## Overview

We've implemented **standard ORM navigation properties** with **lazy loading** for our entities:

- ✅ **Session** → User (ManyToOne)
- ✅ **Todo** → User (ManyToOne) 
- 🔄 **User** → Todos & Sessions (OneToMany) *[in progress]*

## 🚀 Usage Examples

### **1. Session with User Navigation**

```typescript
// Get session with user navigation
const session = await sessionRepo.findById(sessionId);

// Access user directly (lazy loading)
console.log(`Session belongs to: ${session.user.getUsername()}`);

// Or use the getter method
const user = session.getUser();
console.log(`User ID: ${user.getId()}`);
```

### **2. Todo with User Navigation**

```typescript
// Get todo with user navigation
const todo = await todoRepo.findById(todoId);

// Access user directly (lazy loading)
console.log(`Todo belongs to: ${todo.user.getUsername()}`);

// Or use the getter method
const user = todo.getUser();
console.log(`User ID: ${user.getId()}`);
```

### **3. Repository Queries with Navigation**

```typescript
// Find todos and automatically populate user data
const todos = await em.find(Todo, { userId }, { populate: ['user'] });

todos.forEach(todo => {
  console.log(`${todo.getContent()} - ${todo.user.getUsername()}`);
});
```

### **4. Application Service Usage**

```typescript
export class TodoApplicationService {
  async getTodoWithOwner(todoId: number): Promise<{
    todo: any;
    owner: any;
  }> {
    const todo = await this.todoRepo.findById(todoId);
    
    if (!todo) {
      throw new Error('Todo not found');
    }

    // Navigation property automatically loaded
    const owner = todo.getUser();

    return {
      todo: todo.toJSON(),
      owner: {
        id: owner.getId(),
        username: owner.getUsername()
      }
    };
  }
}
```

## 🔧 MikroORM Configuration

### **Lazy Loading Setup**
```typescript
// All relationships use lazy: true
@ManyToOne(() => User, { joinColumn: 'user_id', lazy: true })
public user!: User;
```

### **Auto-Population** 
```typescript
// Populate relationships in queries
await em.find(Todo, {}, { populate: ['user'] });
await em.find(Session, {}, { populate: ['user'] });
```

### **Manual Loading**
```typescript
// If needed, manually load relationships
await em.populate(todo, ['user']);
await em.populate(session, ['user']);
```

## ✅ Benefits

1. **Clean ORM Pattern** - Standard navigation properties
2. **Lazy Loading** - No N+1 queries by default
3. **Type Safety** - Full TypeScript support
4. **Simple Usage** - Direct property access
5. **Flexible Queries** - Control when to populate

## 🎯 Next Steps

1. **Complete User OneToMany** - Add todos/sessions collections
2. **Repository Enhancements** - Add populate helpers
3. **Query Optimization** - Selective population
4. **Testing** - Verify lazy loading behavior

This approach gives us the best of both worlds: **clean ORM patterns** with **performance control**! 