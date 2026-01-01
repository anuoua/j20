// 定义组件属性类型
interface TodoItemProps {
  text: string;
  completed: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

// TodoItem组件
export const TodoItem = ($props: TodoItemProps) => {
  // 入参解构要使用 $ 开头别名，这样才是响应式的
  // 或者使用 $props.xx 直接取
  const {
    text: $text,
    completed: $completed,
    onToggle: $onToggle = () => {},
    onDelete: $onDelete = () => {},
  } = $props;

  return (
    <div class="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div class="flex items-center">
        {/* 复选框 */}
        <input
          type="checkbox"
          class="h-5 w-5 mr-3 text-blue-500 rounded focus:ring-blue-400"
          checked={$completed}
          onChange={() => $onToggle()}
        />

        {/* Todo文本 */}
        <span
          class={$completed ? "line-through text-gray-500" : "text-gray-800"}
        >
          {$text}
        </span>
      </div>

      {/* 删除按钮 */}
      <button
        class="text-red-500 hover:text-red-700 transition-colors"
        onClick={() => $onDelete()}
      >
        删除
      </button>
    </div>
  );
};
