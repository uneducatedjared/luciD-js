"use client";
import { Input } from "@/components/ui/input";
import { designStore } from "@/stores/designStore";


export default function Header() {
  const { name, setName } = designStore((state) => state);

  return (
    <header className="header-gradient header flex items-center justify-between px-4 h-14">
      {/* 设计名称输入框 */}
      <div className="flex-1 flex justify-center max-w-md">
        <Input
          className="w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="无标题设计" // 添加一个占位符
        />
      </div>
    </header>
  );
}