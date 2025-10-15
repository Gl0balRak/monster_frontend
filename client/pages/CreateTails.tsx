import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input, Select, Checkbox, InputURL, Textarea } from "@/components/forms";
import { Button } from "@/components/buttons";
import { FileUpload } from "@/components/ui/FileUpload";
import {
  SortableTable,
  TableColumn,
  TableRow,
} from "@/components/tables/SortableTable.tsx";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FileList } from "@/components/ui/FileList";
import ToolDescription from "@/components/ToolDescription/ToolDescription";
import { useQueryIndex } from "@/hooks/useQueryIndex";
import { HelpTooltip } from "@/components/ui/HelpTooltip.tsx";

const CreateTails: React.FC = () => {
  // Входные параметры
  const [pageUrl, setPageUrl] = useState("");
  const [mainQuery, setMainQuery] = useState("");
  const [n, setN] = useState("2");
  const [overlay, setOverlay] = useState(false);
  // Стоп-слова
  const [excludeWords, setExcludeWords] = useState("");

  // Кнопки скачивания
  const [downloadingTails, setDownloadingTails] = useState(false);

  /*
  // Восстановление значений из localStorage
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem("queryIndexForm");
      if (!savedStr) return;
      const saved = JSON.parse(savedStr);
      //setKeywordsText(saved.keywordsText || "");
    }
    catch (e) {
      console.error("Failed to restore QueryIndex form from storage", e);
    }
  }, []);

  // Сохранение значений в localStorage
  useEffect(() => {
    const state = {
      //keywordsText,
    };
    try {
      localStorage.setItem("queryIndexForm", JSON.stringify(state));
    } catch {}
  }, [
    //keywordsText,
  ]);
  */

  // API интеграция
  const {
    isLoading,
  } = useQueryIndex();


  return (
    <div className="flex-1 bg-gray-0 p-3">
      <div className="w-full">
        <div className="bg-white rounded-lg p-6 space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Создание хвостов
            </h1>
          </div>
          {/* URL and Query */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <InputURL
                  type="url"
                  label="URL сайта"
                  value={pageUrl}
                  onChange={setPageUrl}
                  autoProtocol={true}
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Основной запрос"
                  placeholder="Введите значение"
                  value={mainQuery}
                  onChange={setMainQuery}
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <Select
              label="Длинна хвоста"
              placeholder="Выберите..."
              value={n}
              onChange={setN}
              options={[
                { value: "2", label: "2" },
                { value: "4", label: "4" },
              ]}
            />
            <Checkbox
              label="Наложение хвостов"
              checked={overlay}
              onChange={setOverlay}
            />


        </div>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 items-center">
            <label className="text-base font-normal text-black block mb-2">
              Стоп-слова:
            </label>
            <Textarea
              placeholder="Стов-слова"
              value={excludeWords}
              onChange={setExcludeWords}
              rows={4}
            />
          </div>
      </div>
    </div>
    </div>
  );
};

export default CreateTails;