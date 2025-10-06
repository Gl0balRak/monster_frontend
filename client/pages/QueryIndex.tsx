import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input, Textarea, Select, Checkbox } from "@/components/forms";
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
import { typography } from "@/lib/design-system";
import { useQueryIndex } from "@/hooks/useQueryIndex";

const QueryIndexPage: React.FC = () => {
  // Входные параметры
  const [keywordsText, setKeywordsText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsingDepth, setParsingDepth] = useState("1");
  const [competitorTopSize, setCompetitorTopSize] = useState("10");

  // Фильтры с новым списком параметров
  const [filters, setFilters] = useState({
    duplicates: false,
    stopWords: false,
    latin: false,
    numbers: false,
    singleWords: false,
    symbols: false,
    adult: false,
    citiesRF: false,
    wordRepeats: false,
  });

  // Стоп-слова
  const [stopWordsText, setStopWordsText] = useState("");

  // Исключение городов
  const [excludeCitiesText, setExcludeCitiesText] = useState("");

  // Результаты
  const [selectedTableRows, setSelectedTableRows] = useState<string[]>([]);

  // Пагинация для ключевых слов
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Кнопки скачивания
  const [downloadingKeywords, setDownloadingKeywords] = useState(false);
  const [downloadingCompetitors, setDownloadingCompetitors] = useState(false);

  // Восстановление значений из localStorage
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem("queryIndexForm");
      if (!savedStr) return;
      const saved = JSON.parse(savedStr);
      setKeywordsText(saved.keywordsText || "");
      setParsingDepth(saved.parsingDepth || "1");
      setCompetitorTopSize(saved.competitorTopSize || "10");
      setStopWordsText(saved.stopWordsText || "");
      setExcludeCitiesText(saved.excludeCitiesText || "");
      if (saved.filters) {
        setFilters({
          duplicates: !!saved.filters.duplicates,
          stopWords: !!saved.filters.stopWords,
          latin: !!saved.filters.latin,
          numbers: !!saved.filters.numbers,
          singleWords: !!saved.filters.singleWords,
          symbols: !!saved.filters.symbols,
          adult: !!saved.filters.adult,
          citiesRF: !!saved.filters.citiesRF,
          wordRepeats: !!saved.filters.wordRepeats,
        });
      }
    } catch (e) {
      console.error("Failed to restore QueryIndex form from storage", e);
    }
  }, []);

  // Сохранение значений в localStorage
  useEffect(() => {
    const state = {
      keywordsText,
      parsingDepth,
      competitorTopSize,
      stopWordsText,
      excludeCitiesText,
      filters,
    };
    try {
      localStorage.setItem("queryIndexForm", JSON.stringify(state));
    } catch {}
  }, [
    keywordsText,
    parsingDepth,
    competitorTopSize,
    stopWordsText,
    excludeCitiesText,
    filters,
  ]);

  // API интеграция
  const {
    isLoading,
    progress,
    hasResults,
    data,
    error,
    startParsing,
    downloadKeywords,
    downloadCompetitors,
  } = useQueryIndex();

  // Обработка загрузки файлов
  const handleFileUpload = (file: File | null) => {
    if (file) {
      setUploadedFiles([...uploadedFiles, file]);
    }
  };

  // Удаление файла
  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  // Обраб��тка изменения фильтров
  const handleFilterChange = (filterKey: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: checked,
    }));
  };

  // Валидация данных
  const isDataValid = () => {
    const hasKeywords = keywordsText.trim().length > 0;
    const hasFiles = uploadedFiles.length > 0;
    return hasKeywords || hasFiles;
  };

  // Запуск парсинга
  const handleStartParsing = async () => {
    if (!isDataValid()) {
      alert("Введите хотя бы одно ключевое слово или загрузите файл");
      return;
    }

    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          // reader.result может быть null, поэтому проверяем
          const result = reader.result?.toString() || "";
          // Разделяем строку data:*/*;base64,<base64data>
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = (error) => reject(error);
      });
    };

    // Подготовка данных для API
    const filesContent: string[] = [];
    const filesNames: string[] = [];

    for (const file of uploadedFiles) {
      try {
        const text = await fileToBase64(file);

        filesContent.push(text);
        filesNames.push(file.name);
      } catch (err) {
        console.error("Error reading file:", file.name, err);
      }
    }

    // Подготовка настр��ек фильтров
    const cleaningSettings = JSON.stringify(filters);

    // Запуск парсинга через API
    await startParsing({
      keywords: keywordsText,
      files: filesContent,
      fileNames: filesNames,
      stopWords: stopWordsText,
      excludeCities: excludeCitiesText,
      filters: cleaningSettings,
      topSize: competitorTopSize,
      parsingDepth: parsingDepth,
    });
  };

  // Экспорт ключевых слов
  const handleExportKeywords = async () => {
    try {
      setDownloadingKeywords(true);
      await downloadKeywords();
    } catch (err) {
      console.error("Export error:", err);
      alert("Ошибка при скачивании файла");
    } finally {
      setDownloadingKeywords(false);
    }
  };

  // Экспорт конкурентов
  const handleExportCompetitors = async () => {
    try {
      setDownloadingCompetitors(true);
      await downloadCompetitors();
    } catch (err) {
      console.error("Export error:", err);
      alert("Ошибка при скачивании файла");
    } finally {
      setDownloadingCompetitors(false);
    }
  };

  // Переход в оптимизацию
  const goToOptimization = () => {
    // Здесь будет логика перехода в инструмент оптимизации
    console.log("Переход в Монстр оптимизации...");
    alert('Переход в инструмент "Монстр оптимизации"');
  };

  // Колонки для таблицы ключевых слов
  const keywordColumns: TableColumn[] = [
    { key: "keyword", label: "Ключевое слово", sortable: true },
    { key: "value1", label: "Клики", sortable: true },
    { key: "value2", label: "Спрос", sortable: true },
    { key: "value3", label: "Конкурентность", sortable: true },
  ];

  // Колонки для таблицы конкурентов
  const competitorColumns: TableColumn[] = [
    { key: "url", label: "URL страницы/конкурента", sortable: true },
    { key: "queryCount", label: "Кол-во ссылок", sortable: true },
    // { key: "frequency", label: "Частота", sortable: true },
    // { key: "pageType", label: "Главная/внутренняя", sortable: true },
  ];

  // Обработка данных ключевых слов с пагинацией
  const processedKeywords = useMemo(() => {
    if (!hasResults || !data?.keywords) return [];

    return data.keywords.map((keywordData, index) => ({
      id: index.toString(),
      keyword: keywordData[0] || "",
      value1: keywordData[1]?.toLocaleString() || "0",
      value2: keywordData[2]?.toLocaleString() || "0",
      value3: keywordData[3]?.toLocaleString() || "0",
    }));
  }, [hasResults, data?.keywords]);

  // Пагинация
  const totalKeywords = processedKeywords.length;
  const totalPages = Math.ceil(totalKeywords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKeywords = processedKeywords.slice(startIndex, endIndex);

  // Данные конкурентов с бекэнда
  const competitorResults: TableRow[] =
    hasResults && data?.competitors
      ? data.competitors.map((competitor: any, index: number) => ({
          id: index.toString(),
          url: competitor[0] ? (
            <a
              href={competitor[0] || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {competitor[0] || ""}
            </a>
          ) : (
            ""
          ),
          queryCount: competitor[1]?.toLocaleString() || "0",
        }))
      : [];

  return (
    <div className="flex-1 bg-gray-0 p-6">
      <div className="w-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Левая панель - Входные параметры */}
          <div className="space-y-6">
            {/* Блок 1: Список слов */}
            <div className="bg-white rounded-lg p-6">
              <h2 className={cn(typography.blockTitle, "mb-4")}>Список слов</h2>
              <p className={cn(typography.bodyText, "text-gray-5 mb-4")}>
                Введите ключевые слова для парсинга через запятую или с новой
                строки
              </p>

              <div className="overflow-hidden mb-6">
                <ToolDescription
                  shortDescription="Данный компонент сайта, находится в разработке"
                  fullDescription={
                    <div className="overflow-hidden mb-6 flex justify-center items-center p-8 bg-gray-50 rounded-lg border-gray-300">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Компонент в разработке</p>
                      </div>
                    </div>
                  }
                />
              </div>

              <Textarea
                placeholder="купить телефон, смартфон недорого, мобильный телефон&#10;планшет&#10;ноутбук"
                value={keywordsText}
                onChange={setKeywordsText}
                rows={6}
              />
            </div>

            {/* Блок 2: Загрузка файлов */}
            <div className="bg-white rounded-lg p-6">
              <h2 className={cn(typography.blockTitle, "mb-4")}>
                Загрузка файлов
              </h2>

              <FileUpload
                onFileSelect={handleFileUpload}
                acceptedTypes=".xlsx,.csv"
                className="mb-4"
              />

              <FileList files={uploadedFiles} onRemoveFile={removeFile} />
            </div>

            {/* Блок 3: Настройки парсинга */}
            <div className="bg-white rounded-lg p-6">
              <h2 className={cn(typography.blockTitle, "mb-4")}>
                Настройки парсинга
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Глубина парсинга"
                  value={parsingDepth}
                  onChange={setParsingDepth}
                  options={[
                    { value: "1", label: "1 уровень" },
                    { value: "2", label: "2 уровня" },
                  ]}
                />

                <Input
                  label="Размер топа конкурентов"
                  type="number"
                  value={competitorTopSize}
                  onChange={setCompetitorTopSize}
                />
              </div>
            </div>

            {/* Блок 4: Фильтры */}
            <div className="bg-white rounded-lg p-6">
              <h2 className={cn(typography.blockTitle, "mb-4")}>Фильтры</h2>

              <div className="space-y-6">
                {/* Чекбоксы фильтров */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Checkbox
                    label="Дубли (удаляет полные дубли фраз)"
                    checked={filters.duplicates}
                    onChange={(checked) =>
                      handleFilterChange("duplicates", checked)
                    }
                  />
                  <Checkbox
                    label="Стоп-слова (поиск вхождений)"
                    checked={filters.stopWords}
                    onChange={(checked) =>
                      handleFilterChange("stopWords", checked)
                    }
                  />
                  <Checkbox
                    label="Латиница (удаляет фразы с латиницей)"
                    checked={filters.latin}
                    onChange={(checked) => handleFilterChange("latin", checked)}
                  />
                  <Checkbox
                    label="Цифры (удаляет фразы с цифрами)"
                    checked={filters.numbers}
                    onChange={(checked) =>
                      handleFilterChange("numbers", checked)
                    }
                  />
                  <Checkbox
                    label="Однословники (удаляет фразы из 1 слова)"
                    checked={filters.singleWords}
                    onChange={(checked) =>
                      handleFilterChange("singleWords", checked)
                    }
                  />
                  <Checkbox
                    label="Прочие символы (знаки препинания)"
                    checked={filters.symbols}
                    onChange={(checked) =>
                      handleFilterChange("symbols", checked)
                    }
                  />
                  <Checkbox
                    label="18+ (удаляет adult контент)"
                    checked={filters.adult}
                    onChange={(checked) => handleFilterChange("adult", checked)}
                  />
                  <Checkbox
                    label="Города РФ (чистка по городам России)"
                    checked={filters.citiesRF}
                    onChange={(checked) =>
                      handleFilterChange("citiesRF", checked)
                    }
                  />
                  <Checkbox
                    label="Повторы слов (статистка по повторам)"
                    checked={filters.wordRepeats}
                    onChange={(checked) =>
                      handleFilterChange("wordRepeats", checked)
                    }
                  />
                </div>

                {/* Поле для ��топ-слов */}
                <div>
                  <Textarea
                    label="Стоп-слова"
                    placeholder="Введите стоп-слова через запятую или с новой строки"
                    value={stopWordsText}
                    onChange={setStopWordsText}
                    rows={3}
                  />
                  <Textarea
                    label="Исключение городов"
                    placeholder="Введите города для исключения через запятую или с новой строки. Эти города не будут исключаться при выборе параметра чистки «Города РФ». Например, если вы хотите, чтобы были исключены все города, кроме Санкт-Петербурга, то в этом поле укажите Санкт-Петербург, а также все подходящие формы его названия, например: «Санкт-Петербург, СПб»."
                    value={excludeCitiesText}
                    onChange={setExcludeCitiesText}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Блок 5: Кнопка запуска */}
            <div className="bg-white rounded-lg p-6">
              <Button
                variant="filled"
                size="large"
                onClick={handleStartParsing}
                disabled={isLoading || !isDataValid()}
                className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600 disabled:bg-gray-400 disabled:border-gray-400"
                leftIcon={
                  isLoading ? (
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-25"
                      ></circle>
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        className="opacity-75"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )
                }
              >
                {isLoading ? "Выполняется парсинг..." : "Запустить парсинг"}
              </Button>

              {isLoading && (
                <div className="mt-4">
                  <ProgressBar
                    progress={progress}
                    label="Прогресс парсинга"
                    color="red"
                  />
                  {/*<ProgressBar*/}
                  {/**/}
                  {/*  color="red"*/}
                  {/*/>*/}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className={cn(typography.bodyText, "text-red-700")}>
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Правая панель - Результаты */}
          <div className="space-y-6">
            {!hasResults && !isLoading && (
              <div className="bg-white rounded-lg p-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className={cn(typography.fieldLabel, "mb-2")}>
                  Результаты парсинга
                </h3>
                <p className={cn(typography.bodyText, "text-gray-5")}>
                  Запустите парсинг для получения результатов
                </p>
              </div>
            )}

            {hasResults && (
              <>
                {/* Таблица ключевых слов с пагинацией */}
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={cn(typography.blockTitle)}>
                      Ключевые слова
                    </h2>
                    <Button
                      variant="outline"
                      size="medium"
                      onClick={handleExportKeywords}
                      disabled={downloadingKeywords}
                      leftIcon={
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      }
                    >
                      {downloadingKeywords ? "Скачивание..." : "Скачать XLSX"}
                    </Button>
                  </div>

                  <SortableTable
                    columns={keywordColumns}
                    rows={currentKeywords}
                    selectedRows={selectedTableRows}
                    onRowSelectionChange={setSelectedTableRows}
                  />

                  {totalKeywords > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span
                          className={cn(typography.bodyText, "text-gray-5")}
                        >
                          Показано {startIndex + 1}-
                          {Math.min(endIndex, totalKeywords)} из {totalKeywords}{" "}
                          ключевых слов
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(typography.bodyText, "text-gray-5")}
                          >
                            Строк на странице:
                          </span>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="border border-gray-2 rounded px-2 py-1 text-sm"
                          >
                            <option value={5}>5</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                            className="min-w-[40px] h-[32px]"
                          >
                            ←
                          </Button>

                          <div className="flex items-center gap-1">
                            {(() => {
                              const maxVisiblePages = 5;
                              const startPage = Math.max(
                                1,
                                currentPage - Math.floor(maxVisiblePages / 2),
                              );
                              const endPage = Math.min(
                                totalPages,
                                startPage + maxVisiblePages - 1,
                              );
                              const adjustedStartPage = Math.max(
                                1,
                                endPage - maxVisiblePages + 1,
                              );

                              const pages = [];
                              for (
                                let i = adjustedStartPage;
                                i <= endPage;
                                i++
                              ) {
                                const isActive = i === currentPage;
                                pages.push(
                                  <Button
                                    key={i}
                                    variant={isActive ? "filled" : "outline"}
                                    size="small"
                                    onClick={() => setCurrentPage(i)}
                                    className={cn(
                                      "min-w-[40px] h-[32px]",
                                      isActive && "bg-red-600 text-white",
                                    )}
                                  >
                                    {i}
                                  </Button>,
                                );
                              }

                              return pages;
                            })()}
                          </div>

                          <Button
                            variant="outline"
                            size="small"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="min-w-[40px] h-[32px]"
                          >
                            →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Таблица конкурентов */}
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={cn(typography.blockTitle)}>
                      Топовые конкуренты / страницы
                    </h2>
                    <Button
                      variant="outline"
                      size="medium"
                      onClick={handleExportCompetitors}
                      disabled={downloadingCompetitors}
                      leftIcon={
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      }
                    >
                      {downloadingCompetitors
                        ? "Скачивание..."
                        : "Скачать XLSX"}
                    </Button>
                  </div>

                  <SortableTable
                    columns={competitorColumns}
                    rows={competitorResults}
                    selectedRows={[]}
                    onRowSelectionChange={() => {}}
                  />
                </div>

                {/* Кнопка перехода в оптимизацию */}
                <div className="bg-white rounded-lg p-6">
                  <h3 className={cn(typography.fieldLabel, "mb-4")}>
                    Дальнейшие действия
                  </h3>
                  <Button
                    variant="filled"
                    size="large"
                    onClick={goToOptimization}
                    className="w-full bg-green-600 hover:bg-green-700 text-white border-green-600"
                    leftIcon={
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    }
                  >
                    Перейти в «Монстр оптимизации»
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryIndexPage;
