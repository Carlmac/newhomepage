<template>
  <div id="todo-app" class="col-sm-4">

    <h1>记住 <br>
      <small>To Do</small>
    </h1>

    <div id="todo-item-container">

      <!-- 已完成/未完成 todo 的导航 -->
      <ul class="nav nav-tabs" role="tablist">
        <li role="presentation" class="active"><a href="#completeTodos" aria-controls="home" role="tab" data-toggle="tab">未完成</a></li>
        <li role="presentation"><a href="#uncompletedTodos" aria-controls="profile" role="tab" data-toggle="tab">已完成</a></li>
      </ul>

      <!-- 已完成 todo -->
      <div class="tab-content" v-bind:class="{ loading: isGettingItems }">
        <div role="tabpanel" class="tab-pane fade in active" id="completeTodos">
          <ul class="list-group">

            <!-- todo 列表 -->
            <li
              class="todo-item list-group-item"
              v-for="(todoItem, index) in todoItems"
              v-if="!todoItem.is_complete"
              v-bind:key="todoItem.todo_id"
            >
              <div v-show="todoItem !== editingItem">
                <!-- todo 完成/未完成 checkbox -->
                <input
                  type="checkbox"
                  v-model="todoItem.is_complete"
                  v-on:click="toggleTodo(todoItem, index)"
                >
                <!-- todo 内容 -->
                <span class="todo-content" v-bind:class="{ complete: todoItem.is_complete }">{{ todoItem.content }}</span>
                <!-- todo 编辑/删除按钮 -->
                <span class="todo-item-control">
                  <a
                    class="todo-item-edit"
                    href="#"
                    v-on:click.prevent="editTodo(todoItem)"
                  >
                    <span class="icon fa fa-pencil"></span>
                  </a>
                  <a
                    class="todo-item-delete"
                    href="#"
                    v-on:click.prevent="removeItem(index)"
                  >
                    <span class="icon fa fa-trash"></span>
                  </a>
                </span>
              </div>

              <!-- 已完成 todo 的编辑界面 -->
              <div v-show="todoItem === editingItem">
                <form class="form" role="form" v-on:submit.prevent>
                  <div class="form-group">
                    <input
                      class="form-control todoEditor"
                      type="text"
                      autocomplete="off"
                      v-focus="todoItem === editingItem"
                      v-model="todoItem.content"
                      v-on:keyup.enter="doneEdit(todoItem, index)"
                      v-on:keyup.esc="cancelEdit(todoItem)"
                    >
                  </div>

                  <!-- todo 确定/取消 编辑 -->
                  <button class="btn btn-success btn-sm" v-on:click.prevent="doneEdit(todoItem, index)">
                    <span class="icon fa fa-check"></span> 确定
                  </button>
                  <button class="btn btn-default btn-sm" v-on:click="cancelEdit(todoItem)">
                    <span class="icon fa fa-close"></span> 取消
                  </button>
                </form>
              </div>
            </li><!-- todo 列表结束 -->
          </ul>
        </div>

        <!-- 未完成 todo -->
        <div role="tabpanel" class="tab-pane fade" id="uncompletedTodos">
          <ul class="list-group">

            <!-- todo 列表 -->
            <li
              class="todo-item list-group-item"
              v-for="(todoItem, index) in todoItems"
              v-if="todoItem.is_complete"
              v-bind:key="todoItem.todo_id"
            >
              <div v-show="todoItem !== editingItem">
                <input
                  type="checkbox"
                  v-model="todoItem.is_complete"
                  v-on:click="toggleTodo(todoItem, index)"
                >
                <span class="todo-content" v-bind:class="{ complete: todoItem.is_complete }">{{ todoItem.content }}</span>
                <span class="todo-item-control">
                  <a
                    class="todo-item-edit"
                    href="#"
                    v-on:click.prevent="editTodo(todoItem)"
                  >
                    <span class="icon fa fa-pencil"></span>
                  </a>
                  <a
                    class="todo-item-delete"
                    href="#"
                    v-on:click.prevent="removeItem(index)"
                  >
                    <span class="icon fa fa-trash"></span>
                  </a>
                </span>
              </div>

              <!-- todo 编辑界面 -->
              <div v-show="todoItem === editingItem">
                <form class="form" role="form" v-on:submit.prevent>
                  <div class="form-group">
                    <input
                      class="form-control todoEditor"
                      type="text"
                      autocomplete="off"
                      v-focus="todoItem === editingItem"
                      v-model.trim="todoItem.content"
                      v-on:keyup.enter="doneEdit(todoItem, index)"
                      v-on:keyup.esc="cancelEdit(todoItem)"
                    >
                  </div>
                  <button class="btn btn-success btn-sm" v-on:click.prevent="doneEdit(todoItem, index)">
                    <span class="icon fa fa-check"></span> 确定
                  </button>
                  <button class="btn btn-default btn-sm" v-on:click="cancelEdit(todoItem)">
                    <span class="icon fa fa-close"></span> 取消
                  </button>
                </form>
              </div>
            </li><!-- 未完成 todo 列表结束 -->
          </ul>
        </div>
      </div>
    </div><!-- todo 容器结束 -->

    <!-- 添加新 todo 界面 -->
    <div id="todo-add">

      <!-- 显示表单的按钮 -->
      <div
        id="todo-add-btn"
        v-show="!isAddingSeen"
        v-on:click="showAddingForm"
      >
        <span><span class="icon fa fa-plus"></span> 添加一个事项</span>
      </div>

      <!-- 添加 todo 的表单 -->
      <div id="todo-add-form" v-show="isAddingSeen">
        <form class="form" role="form" v-on:submit.prevent>
          <div class="form-group">
            <input
              class="form-control"
              id="inputNewTodo"
              type="text"
              placeholder="要做什么事？"
              autocomplete="off"
              v-model.trim="newTodo.content"
              v-on:keyup.enter="addItem"
              v-on:keyup.esc="cancelAdd($event)"
              v-on:blur="cancelAdd($event)"
            >
          </div>
        </form>
        <button
          class="btn btn-success"
          id="submitNewTodo"
          v-bind:disabled="isAddingItem"
          v-on:click="addItem"
        >
          <span class="icon fa fa-plus"></span> 添加
        </button>
      </div>
    </div><!-- end of #todo-add -->

    <!-- 错误信息 -->
    <div class="alert alert-danger" role="alert" v-show="errorMsg.hasError">
      <strong>发生错误！</strong>{{ errorMsg.text }}
    </div>

  </div><!-- end of #todo-app -->
</template>

<script>
  import axios from 'axios';
  import qs from 'qs';
  export default {

    name: 'todo-app',

    data: function() {

      return {

        todoItems: [
//          {
//            todo_id: 1,
//            user_id: 1,
//            content: '去买菜',
//            is_complete: false
//          }
        ],

        editingItem: null,

        beforeEditCache: '',

        newTodo: {
          todo_id: 0,
          content: '',
          is_complete: false
        },

        isGettingItems: false,

        isAddingItem: false,

        isAddingSeen: false,

        STORAGE_KEY: 'todo-app',

        errorMsg: {
          hasError: false,
          text: '',
          map: {
            // get
            101: '提交的用户ID不正确。',
            // add
            201: '找不到对应用户ID。',
            202: '无法添加该记录到数据库。',
            // edit
            301: '数据库中没有这个 todo。',
            302: '编辑 todo 失败。',
            // toggle
            401: '数据库中没有这个 todo。',
            402: '更改 todo 失败。',
            // remove
            501: '数据库中没有这个 todo。',
            502: '删除 todo 失败。',
            // common
            600: '提交的数据有误。',
            // no correct response
            'nores': '服务器发生错误。',
            // 提交了空 todo
            'empty': '不能建立空事项',
            // other
            'other': ''
          }
        }

      }

    },

    computed: {

      isSignIned: function() {
        return this.$store.state.auth.isSignIned;
      }

    },

    watch: {
      // todo 发生变化，也就是被正确地更改后清除错误信息
      todoItems: {
        deep: true,
        handler: function() {
          this.dismissErrorMsg();
        }
      }
    },

    directives: {
      focus: {
        update: function (el, binding) {
          if (!binding.value) {
            return;
          }
          setTimeout(function () {
            el.focus();
          }, 0);
        }
      }
    },

    methods: {


      // 获取 todos
      getTodoItems: function() {

        if (this.isGettingItems) {return;}

        if (this.isSignIned) {

          // 清空当前 todos
          this.todoItems = [];
          this.isGettingItems = true;

          let requestData = {
            user_id: this.$store.state.auth.user_id
          };

          axios
          .get(
            '/api/todo_get.php',
            {
              params: requestData
            }
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  let data = res.data.data;
                  // 把 1 转换为 true，0 转换为 false
                  if (data.todoItems.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                      data.todoItems[i]['is_complete'] = !!data.todoItems[i]['is_complete'];
                    }
                    this.todoItems = data.todoItems;
                  }
                } else {
                  this.showErrorMsg(res.data.status.code);
                }
              } else {
                this.showErrorMsg('nores');
              }
              this.isGettingItems = false;
            }
          )
          .catch(
            (error) => {
              this.showErrorMsg('other', error);
              this.isGettingItems = false;
            }
          );

        } else {
          if (!localStorage.getItem(this.STORAGE_KEY)) {
            // 未登录且没有本地记录时插入一条当天的记录
            let defaultLocalTodos = [
              {
                todo_id: 1,
                content: '在这里记录你的待办事项',
                is_complete: false,
              },
              {
                todo_id: 2,
                content: '登录后可以保存到服务器',
                is_complete: false,
              }
            ];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultLocalTodos));
            this.todoItems = defaultLocalTodos;
          } else {
            this.todoItems =  JSON.parse(localStorage.getItem(this.STORAGE_KEY));
          }
        }
      },

      // 添加 todo
      addItem: function () {

        if (this.isAddingItem) {
          return;
        }

        if (!this.newTodo.content) {
//          alert('不能建立空事项');
          this.showErrorMsg('empty');
          document.getElementById('inputNewTodo').focus();
          return;
        }

        if (this.isSignIned) {

          this.isAddingItem = true;

          let requestData = qs.stringify({
            // todo id 是自增长的，is_complete 是默认为 false 的
            content: this.newTodo.content,
            user_id: this.$store.state.auth.user_id
          });

          axios
          .post(
            '/api/todo_add.php',
            requestData
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  res.data.data['is_complete'] = false;
                  this.todoItems.push(res.data.data);
                } else {
                  this.showErrorMsg(res.data.status.code);
                }
              } else {
                this.showErrorMsg('nores');
              }
              this.isAddingItem = false;
            }
          )
          .catch(
            (error) => {
              this.showErrorMsg('other', error);
              this.isAddingItem = false;
            }
          );

        } else {
          this.newTodo.todo_id = this.todoItems[0] ? (this.todoItems[this.todoItems.length - 1]['todo_id'] + 1) : 1;
          this.todoItems.push(this.newTodo);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todoItems));
        }
        this.newTodo = {
          todo_id: 0,
          content: '',
          is_complete: false
        };
        this.isAddingSeen = false;
      },

      cancelAdd: function (event) {
        if (!this.isAddingSeen) {return;}
        if (event && event.type === 'blur') {
          if (this.newTodo.content === '') {
            this.isAddingSeen = false;
          }
        } else {
          this.isAddingSeen = false;
        }
      },

      showAddingForm: function () {
        this.isAddingSeen = true;
        setTimeout(function () {
          document.getElementById('inputNewTodo').focus();
        }, 0);
      },

      // 编辑
      editTodo: function (todo) {
        this.beforeEditCache = todo.content;
        this.editingItem = todo;
      },

      cancelEdit: function (todo) {
        todo.content = this.beforeEditCache;
        this.editingItem = null;
      },

      doneEdit: function (todo, index) {

        if (!this.editingItem) {
          return;
        }

        if (!todo.content) {
          this.removeItem(index);
          return;
        }

        if (this.isSignIned) {

          let requestData = qs.stringify({
            todo_id: this.editingItem.todo_id,
            content: this.editingItem.content,
            user_id: this.$store.state.auth.user_id
          });

          axios
          .post(
            '/api/todo_edit.php',
            requestData
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  todo.content = res.data.data.content;
                  this.editingItem = null;
                } else {
                  this.showErrorMsg(res.data.status.code);
//                  this.cancelEdit(todo);
                }
              } else {
                this.showErrorMsg('nores');
              }
            }
          )
          .catch(
            (error) => {
//              this.cancelEdit(todo);
              this.showErrorMsg('other', error);
            }
          );

        } else {
          todo.content = todo.content.trim();
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todoItems));
          this.editingItem = null;
        }
      },

      // 完成/取消完成 todo
      toggleTodo: function(todo, index) {

        if (this.isSignIned) {

          let requestData = {
            todo_id: this.todoItems[index]['todo_id'],
            user_id: this.$store.state.auth.user_id
          };

          axios
          .get(
            '/api/todo_toggle.php',
            {
              params: requestData
            }
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  this.todoItems[index]['is_complete'] = !!res.data.data.is_complete;
                } else {
                  this.showErrorMsg(res.data.status.code);
                }
              } else {
                this.showErrorMsg('nores');
              }
            }
          )
          .catch(
            (error) => {
              this.showErrorMsg('other', error);
            }
          );

        } else {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todoItems));
        }
      },

      // 删除 todo
      removeItem: function (index) {

        if (this.isSignIned) {

          let requestData = {
            todo_id: this.todoItems[index]['todo_id'],
            user_id: this.$store.state.auth.user_id
          }

          axios
          .get(
            '/api/todo_remove.php',
            {
              params: requestData
            }
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  this.todoItems.splice(index, 1);
                } else {
                  this.showErrorMsg(res.data.status.code);
                }
              } else {
                this.showErrorMsg('nores');
              }
            }
          )
          .catch(
            (error) => {
              this.showErrorMsg('other', error);
            }
          );

        } else {
          this.todoItems.splice(index, 1);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todoItems));
        }
      },

      showErrorMsg: function(errorcode, error) {
        if (!errorcode) {return;}
        this.errorMsg.hasError = true;
        if (error) {
          this.errorMsg.text = error.toString();
        } else {
          this.errorMsg.text = this.errorMsg.map[errorcode] + '(错误码：' + errorcode + ')';
        }
      },

      dismissErrorMsg: function() {
        if (this.errorMsg.hasError === false) {return;}
        this.errorMsg.hasError = false;
      }
    },

    created: function() {
      this.getTodoItems();
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

#todo-app {

  label {
    cursor: pointer;
  }

  .todo-item {
    .todo-content.complete {
      text-decoration: line-through;
    }
  }

  .todo-item-control {
    float: right;
    .todo-item-edit {
      margin-right: 10px;
    }
    a:hover {
      text-decoration: none;
    }
  }

}

#todo-add {

  margin-bottom: 30px;

  #todo-add-btn {
    span:first-of-type {
      cursor: pointer;
    }
  }

  #todo-add-form {
    label {
      cursor: pointer;
    }
  }
}

.nav-tabs {
  border-bottom: none;
}

.loading {
  min-height: 30px;
  background: url('../../../static/img/loading.gif') center center/30px 30px no-repeat;
}

</style>
