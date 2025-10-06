import React, { useState, useMemo, useEffect } from "react";
import { Input, InputURL, Select, Checkbox } from "@/components/forms";
import { Button } from "@/components/buttons";
import { RecalculateButton } from '@/components/buttons/RecalculateButton';
import { AddQuerySection } from "@/components/ui/AddQuerySection";
import { ProgressBar } from "@/components/progress_bars/ProgressBar";
import { ResultsTable } from "@/components/tables/ResultsTable";
import { ComparisonTable } from "@/components/tables/ComparisonTable";
import { LSIResults } from "@/components/tables/LSIResults";
import { KeywordsResults } from "@/components/tables/KeywordsResults";
import { CollocationAnalysisButton } from '@/components/buttons/CollocationAnalysisButton';
import { CollocationResultsDisplay } from '@/components/tables/CollocationResultsDisplay.tsx';
import { useTextAnalyzer } from "@/hooks/useTextAnalyzer";
import { useCollocationAnalysis } from '@/hooks/useCollocationAnalysis';
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import ToolDescription from "@/components/ToolDescription/ToolDescription";
import { useTranslation } from 'react-i18next';

const TextAnalyzerPage: React.FC = () => {
  // Используем наш custom hook
  const {
    isLoading,
    progress,
    results,
    setResults,
    error,
    lsiLoading,
    lsiProgress,
    lsiResults,
    lsiError,
    keywordsLoading,
    keywordsProgress,
    keywordsResults,
    keywordsError,
    startAnalysis,
    loadStopWordsFromFile,
    resetResults,
    analyzeSinglePage,
    startLSIAnalysis,
    startKeywordsAnalysis,
    setLsiResults,
    setKeywordsResults,
  } = useTextAnalyzer();

  const [collocationOriginalPhrases, setCollocationOriginalPhrases] = useState<string[]>([]);

  // Добавляем хук для анализа коллокаций
  const {
    loading: collocationLoading,
    progress: collocationProgress,
    results: collocationResults,
    error: collocationError,
    startCollocationAnalysis,
    resetCollocationResults,
    setCollocationResults,
  } = useCollocationAnalysis();

  // Состояния формы
  const [checkAI, setCheckAI] = useState(false);
  const [checkSpelling, setCheckSpelling] = useState(false);
  const [checkUniqueness, setCheckUniqueness] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [mainQuery, setMainQuery] = useState("");
  const [additionalQueries, setAdditionalQueries] = useState<string[]>([]);
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [excludePlatforms, setExcludePlatforms] = useState(false);
  const [parseArchived, setParseArchived] = useState(false);
  const [searchEngine, setSearchEngine] = useState("yandex");
  const [region, setRegion] = useState("msk");
  const [topSize, setTopSize] = useState("10");
  const [calculateByMedian, setCalculateByMedian] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  // Состояния для таблицы результатов
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [additionalUrl, setAdditionalUrl] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);

  // Дополнительные результаты от анализа отдельных страниц
  const [additionalResults, setAdditionalResults] = useState<
    Array<{
      url: string;
      word_count_in_a?: number;
      word_count_outside_a?: number;
      text_fragments_count?: number;
      total_visible_words?: number;
      parsed_from?: string;
      fallback_used?: boolean;
    }>
  >([]);

  // ✅ Загрузка state из localStorage при открытии
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem("textAnalyzerForm");
      if (!savedStr) return;
      const saved = JSON.parse(savedStr);

      // --- результаты анализа ---
      if (saved.results) {
        setResults(saved.results);
      }

      if (saved.additionalResults) {
        setAdditionalResults(saved.additionalResults);
      }

      // --- выбранные чекбоксы ---
      if (saved.selectedCompetitors) {
        setSelectedCompetitors(saved.selectedCompetitors);
      }

      // --- результаты коллокаций ---
      if (saved.collocationResults) {
        setCollocationResults(saved.collocationResults);
      }

      if (saved.collocationOriginalPhrases) {
        setCollocationOriginalPhrases(saved.collocationOriginalPhrases);
      }

      // --- остальные поля формы ---
      if (saved.pageUrl) setPageUrl(saved.pageUrl);
      if (saved.mainQuery) setMainQuery(saved.mainQuery);
      if (saved.additionalQueries) setAdditionalQueries(saved.additionalQueries);
      if (saved.excludedWords) setExcludedWords(saved.excludedWords);
      if (typeof saved.excludePlatforms === "boolean")
        setExcludePlatforms(saved.excludePlatforms);
      if (typeof saved.parseArchived === "boolean")
        setParseArchived(saved.parseArchived);
      if (saved.searchEngine) setSearchEngine(saved.searchEngine);
      if (saved.region) setRegion(saved.region);
      if (saved.topSize) setTopSize(saved.topSize);
      if (typeof saved.calculateByMedian === "boolean")
        setCalculateByMedian(saved.calculateByMedian);
    } catch (e) {
      console.error("Failed to restore TextAnalyzer form", e);
    }
  }, []);

  // ✅ Сохранение в localStorage при изменениях
  useEffect(() => {
    const formState = {
      pageUrl,
      mainQuery,
      additionalQueries,
      excludedWords,
      excludePlatforms,
      parseArchived,
      searchEngine,
      region,
      topSize,
      calculateByMedian,
      additionalResults,
      results,
      selectedCompetitors,
      collocationOriginalPhrases,
      collocationResults, // добавляем результаты коллокаций
    };

    try {
      localStorage.setItem("textAnalyzerForm", JSON.stringify(formState));
    } catch (e) {
      console.error("Failed to save TextAnalyzer form", e);
    }
  }, [
    pageUrl,
    mainQuery,
    additionalQueries,
    excludedWords,
    excludePlatforms,
    parseArchived,
    searchEngine,
    region,
    topSize,
    calculateByMedian,
    additionalResults,
    results,
    selectedCompetitors,
    collocationResults, // добавляем в зависимости
  ]);

  // Обработчик успешного пересчёта
  const handleRecalculateSuccess = (data: any) => {
    console.log('✅ Обработка успешного пересчёта:', data);

    try {
      // 1. Обновляем данные "Нашего сайта" в основных результатах
      if (data.my_page && results) {
        const updatedResults = {
          ...results,
          my_page: {
            ...results.my_page,
            parsed_data: data.my_page.parsed_data,
            status: data.my_page.status || 'success'
          }
        };

        // Обновляем основные результаты
        setResults(updatedResults);
        console.log('📊 Обновлены данные нашего сайта:', updatedResults.my_page);
      }

      // 2. Обновляем LSI результаты если есть
      if (data.lsi && lsiResults) {
        const updatedLsiResults = {
          unigrams: data.lsi.unigrams || lsiResults.unigrams,
          bigrams: data.lsi.bigrams || lsiResults.bigrams,
          trigrams: data.lsi.trigrams || lsiResults.trigrams
        };

        setLsiResults(updatedLsiResults);
        console.log('📊 Обновлены LSI результаты');
      }

      // 3. Обновляем Keywords результаты если есть
      if (data.keywords && data.keywords.table && keywordsResults) {
        const updatedKeywordsResults = {
          ...keywordsResults,
          table: data.keywords.table,
          search_engine: data.keywords.search_engine || keywordsResults.search_engine
        };

        setKeywordsResults(updatedKeywordsResults);
        console.log('📊 Обновлены Keywords результаты');
      }

      // 4. Обновляем результаты коллокаций если есть
      if (data.collocations) {
        setCollocationResults(data.collocations);
        console.log('📊 Обновлены результаты коллокаций');
      }

      // Показываем уведомление об успехе
      alert('✅ Пересчёт завершён! Данные вашего сайта обновлены во всех таблицах.');

    } catch (error) {
      console.error('❌ Ошибка при обновлении данных:', error);
      alert('Произошла ошибка при обновлении данных. Проверьте консоль.');
    }
  };

  // Обработчик отправки формы
  const handleGetTop = async () => {
    const result = await startAnalysis(
      pageUrl,
      mainQuery,
      additionalQueries,
      excludedWords,
      {
        checkAI,
        checkSpelling,
        checkUniqueness,
        searchEngine,
        region,
        topSize,
        excludePlatforms,
        parseArchived,
        calculateByMedian,
      },
    );

    // Очищаем дополнительные результаты при новом анализе
    if (result && result.success) {
      setAdditionalResults([]);
      setSelectedCompetitors([]);
      console.log("Анализ успешно запущен");
    }
  };

  // Обработчик загрузки файла
  const handleFileUpload = async () => {
    const words = await loadStopWordsFromFile();
    if (words.length > 0) {
      setExcludedWords(words);
    }
  };

  // Обработчики для таблицы результатов
  const handleToggleCompetitor = (url: string) => {
    setSelectedCompetitors((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  };

  const handleSelectAll = () => {
    if (!combinedResults) return;

    if (selectedCompetitors.length === combinedResults.length) {
      setSelectedCompetitors([]);
    } else {
      setSelectedCompetitors(combinedResults.map((c) => c.url));
    }
  };

  const handleAddUrl = async () => {
    if (!additionalUrl.trim()) return;

    setAddingUrl(true);
    try {
      const result = await analyzeSinglePage(additionalUrl);

      if (result.error) {
        alert(`Ошибка: ${result.error}`);
      } else {
        const newResult = {
          url: additionalUrl,
          word_count_in_a: result.word_count_in_a,
          word_count_outside_a: result.word_count_outside_a,
          text_fragments_count: result.text_fragments_count,
          total_visible_words: result.total_visible_words,
          parsed_from: "additional",
          fallback_used: false,
        };

        setAdditionalResults((prev) => [...prev, newResult]);
        setAdditionalUrl("");
      }
    } catch (error) {
      console.error("Error adding URL:", error);
      alert(
        `Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
      );
    } finally {
      setAddingUrl(false);
    }
  };

  // Обработчик LSI анализа
  const handleGoToLSI = async () => {
    if (!results?.my_page?.url || selectedCompetitors.length === 0) {
      alert(
        "Для LSI анализа необходимо выбрать конкурентов и иметь анализ собственной страницы",
      );
      return;
    }

    await startLSIAnalysis(
      selectedCompetitors,
      results.my_page.url,
      mainQuery,
      additionalQueries,
      calculateByMedian,
    );
  };

  // Обработчик для анализа коллокаций
  const handleCollocationAnalysis = async () => {
    if (!results?.my_page?.url || !mainQuery) {
      alert('Для анализа коллокаций необходимо иметь анализ собственной страницы и основной запрос');
      return;
    }

    await startCollocationAnalysis(
      results.my_page.url,
      mainQuery,
      additionalQueries
    );
  };

  // Обработчик анализа ключевых слов
  const handleKeywordsAnalysis = async () => {
    if (!results?.my_page?.url || selectedCompetitors.length === 0) {
      alert(
        "Для анализа ключевых слов необходимо выбрать конкурентов и иметь анализ собственной страницы",
      );
      return;
    }

    await startKeywordsAnalysis(
      selectedCompetitors,
      results.my_page.url,
      mainQuery,
      additionalQueries,
      searchEngine,
    );
  };

  // Объединяем результаты из основного анализа и дополнительные
  const combinedResults = useMemo(() => {
    const mainResults =
      results?.competitors?.map((competitor) => ({
        url: competitor.url,
        word_count_in_a: competitor.parsed_data?.word_count_in_a,
        word_count_outside_a: competitor.parsed_data?.word_count_outside_a,
        text_fragments_count: competitor.parsed_data?.text_fragments_count,
        total_visible_words: competitor.parsed_data?.total_visible_words,
        parsed_from: competitor.parsed_from,
        fallback_used: competitor.fallback_used,
      })) || [];

    return [...mainResults, ...additionalResults];
  }, [results?.competitors, additionalResults]);

  // Преобразуем LSI результаты для компонента LSIResults
  const formattedLSIResults = useMemo(() => {
    console.log('LSI Results in TextAnalyzer:', lsiResults);

    if (!lsiResults) {
      console.log('No LSI results available');
      return null;
    }

    const hasData =
      (lsiResults.unigrams && lsiResults.unigrams.length > 0) ||
      (lsiResults.bigrams && lsiResults.bigrams.length > 0) ||
      (lsiResults.trigrams && lsiResults.trigrams.length > 0);

    if (!hasData) {
      console.log('LSI results are empty');
      return null;
    }

    console.log('Returning LSI results with:', {
      unigrams: lsiResults.unigrams?.length || 0,
      bigrams: lsiResults.bigrams?.length || 0,
      trigrams: lsiResults.trigrams?.length || 0,
    });

    return lsiResults;
  }, [lsiResults]);

  // Подготовка данных для ComparisonTable
  const selectedResults = combinedResults.filter((result) =>
    selectedCompetitors.includes(result.url),
  );

  const mySiteAnalysis = results?.my_page?.parsed_data
    ? {
        word_count_in_a: results.my_page.parsed_data.word_count_in_a,
        word_count_outside_a: results.my_page.parsed_data.word_count_outside_a,
        text_fragments_count: results.my_page.parsed_data.text_fragments_count,
        total_visible_words: results.my_page.parsed_data.total_visible_words,
      }
    : null;

  const helpText = `Сайты с антибот-защитой (CAPTCHA, Cloudflare, WAF) могут быть недоступны для анализа.
Для корректной работы: добавьте наш сервис в исключения вашей системы защиты.
User-Agent строки и IP-адреса предоставляются по запросу в техподдержке.`;

  const { t } = useTranslation();

  return (
    <div className="flex-1 bg-gray-0 p-3">
      <div className="w-full">
        <div className="bg-white rounded-lg p-6 space-y-6">
          {/* Заголовок страницы */}
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Текстовый анализатор
            </h1>
            <p className="text-gray-600 mt-1">
              Проверка страницы и получение ТОП результатов
            </p>
          </div>
          <div className="overflow-hidden">
            <ToolDescription
              shortDescription="Анализ SEO-оптимизации текста и сравнение с конкурентами из поисковой выдачи"
              fullDescription={
                <div className="space-y-3">
                  <p>
                    <strong>Текстовый анализатор</strong> — это комплексный инструмент для глубокого анализа 
                    контента вашей страницы и сравнения его с конкурентами из ТОП поисковой выдачи.
                  </p>
                  
                  <div>
                    <strong>Что анализирует инструмент:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Объем текста и распределение слов по тегам</li>
                      <li>Плотность ключевых слов и LSI-фраз</li>
                      <li>Семантическое ядро и коллокации</li>
                      <li>Уникальность и грамотность текста</li>
                      <li>SEO-параметры конкурентов</li>
                    </ul>
                  </div>

                  <div>
                    <strong>Зачем использовать:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Оптимизировать текст под поисковые системы</li>
                      <li>Найти дополнительные ключевые фразы</li>
                      <li>Увидеть сильные и слабые стороны вашего контента</li>
                      <li>Улучшить позиции в поисковой выдаче</li>
                      <li>Создать более релевантный и полезный контент</li>
                    </ul>
                  </div>
                </div>
              }
            />
          </div>

          {/* Показываем ошибку если есть */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Показываем LSI ошибку если есть */}
          {lsiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Ошибка LSI анализа:</strong> {lsiError}
            </div>
          )}

          {/* Ошибка анализа коллокаций */}
          {collocationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Ошибка анализа коллокаций:</strong> {collocationError}
            </div>
          )}

          {/* Показываем Keywords ошибку если есть */}
          {keywordsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Ошибка анализа ключевых слов:</strong> {keywordsError}
            </div>
          )}

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
              <div className="pt-8">
                <HelpTooltip content={helpText} />
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

          {/* Additional Queries Section */}
          <AddQuerySection
            label={t('additionalQueries.label')}
            maxCount={9}
            onChange={setAdditionalQueries}
            buttonText={t('additionalQueries.addButton')}
            placeholder={t('additionalQueries.placeholder')}
            initialQueries={additionalQueries}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Select
              label="Поисковая система"
              placeholder="Выберите..."
              value={searchEngine}
              onChange={setSearchEngine}
              options={[
                { value: "yandex", label: "Яндекс" },
                { value: "google", label: "Google" },
              ]}
            />
            <Select
              label="Регион"
              placeholder="Выберите или введите текст"
              value={region}
              onChange={setRegion}
              options={[
                { value: "msk", label: "Москва" },
                { value: "spb", label: "Санкт-Петербург" },
                { value: "nsk", label: "Новосибирск" },
                { value: "nn", label: "Нижний Новгород" },
                { value: "ekb", label: "Екатеринбург" },
                { value: "kzn", label: "Казань" },
                { value: "sochi", label: "Сочи" },
                { value: "krd", label: "Краснодар" },
                { value: "smr", label: "Самара" },
                { value: "ufa", label: "Уфа" },
                { value: "rnd", label: "Ростов на-Дону" },
                { value: "omsk", label: "Омск" },
                { value: "chel", label: "Челябинск" },
                { value: "krsk", label: "Красноярск" },
                { value: "perm", label: "Пермь" },
                { value: "vlg", label: "Волгоград" },
                { value: "vor", label: "Воронеж" },
                { value: "srt", label: "Саратов" },
                { value: "tlt", label: "Тольятти" },
                { value: "izh", label: "Ижевск" },
              ]}
              allowCustomValue={true}
            />
            <Select
              label="Размер топа"
              placeholder="Не выбрано"
              value={topSize}
              onChange={setTopSize}
              options={[
                { value: "10", label: "ТОП-10" },
                { value: "20", label: "ТОП-20" },
                { value: "50", label: "ТОП-50" },
              ]}
            />
          </div>

          {/* Parsing Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black font-['Open_Sans',-apple-system,Roboto,Helvetica,sans-serif]">
              Настройки парсинга
            </h2>

            <Checkbox
              label="Исключать площадки (Avito, Яндекс.Услуги, справочники)"
              checked={excludePlatforms}
              onChange={setExcludePlatforms}
            />
            <Checkbox
              label="Парсить сохраненные копии"
              checked={parseArchived}
              onChange={setParseArchived}
            />
            <Checkbox
              label="Считать по медиане"
              checked={calculateByMedian}
              onChange={setCalculateByMedian}
            />

            <div className="flex items-end gap-4">
              <AddQuerySection
                label="Не учитывать слова"
                maxCount={10}
                onChange={setExcludedWords}
                buttonText="+ Добавить стоп-слово"
                placeholder="Стоп-слово"
                initialQueries={excludedWords}
              />
              <Button variant="outline" onClick={handleFileUpload}>
                Загрузить файл
              </Button>
            </div>
          </div>

          {/* Submit Button with loading state */}
          <div className="space-y-4">
            <div className="flex justify-start items-center gap-4">
              <Button
                size="large"
                disabled={!pageUrl || !mainQuery || isLoading}
                onClick={handleGetTop}
              >
                {isLoading ? "Обработка..." : "Получить ТОП"}
              </Button>

              {results && (
                <Button variant="outline" size="medium" onClick={resetResults}>
                  Очистить результаты
                </Button>
              )}
            </div>

            {/* Красный прогресс бар под кнопкой */}
            {isLoading && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <ProgressBar
                  progress={progress}
                  label="Анализ страницы"
                  subLabel="Поиск конкурентов в поисковой выдаче..."
                  showPercentage={true}
                  color="red"
                />
                <p className="text-gray-600 text-sm mt-3">
                  Анализ может занять несколько минут...
                </p>
              </div>
            )}
          </div>

          {/* Results Table */}
          {combinedResults.length > 0 && !isLoading && (
            <ResultsTable
              results={combinedResults}
              mySiteAnalysis={mySiteAnalysis}
              selectedCompetitors={selectedCompetitors}
              onToggleCompetitor={handleToggleCompetitor}
              onSelectAll={handleSelectAll}
              parseSavedCopies={parseArchived}
              additionalUrl={additionalUrl}
              setAdditionalUrl={setAdditionalUrl}
              onAddUrl={handleAddUrl}
              addingUrl={addingUrl}
            />
          )}

          {/* Плавающая кнопка пересчёта - показываем только если есть результаты */}
          {results && combinedResults.length > 0 && (
            <RecalculateButton
              pageUrl={pageUrl}
              competitorData={combinedResults}
              mainQuery={mainQuery}
              additionalQueries={additionalQueries}
              searchEngine={searchEngine}
              medianMode={calculateByMedian}
              lsiData={lsiResults}
              keywordsData={keywordsResults?.table}
              onSuccess={handleRecalculateSuccess}
              onError={(error) => {
                console.error('❌ Ошибка пересчёта:', error);
                alert(`Ошибка пересчёта: ${error}`);
              }}
              disabled={isLoading || lsiLoading || keywordsLoading || collocationLoading || recalculating}
              floating={true}
            />
          )}

          {/* Comparison Table - показываем только если есть выбранные конкуренты */}
          {selectedCompetitors.length > 0 && mySiteAnalysis && !isLoading && (
            <ComparisonTable
              results={selectedResults}
              selectedCompetitors={selectedCompetitors}
              mySiteAnalysis={mySiteAnalysis}
              medianMode={calculateByMedian}
              onGoToLSI={handleGoToLSI}
              lsiLoading={lsiLoading}
              lsiProgress={lsiProgress}
            />
          )}

          {/* LSI Progress Bar */}
          {lsiLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ProgressBar
                progress={lsiProgress}
                label="Прогресс LSI анализа"
                showPercentage={true}
                color="red"
                className="mb-2"
              />
              <p className="text-red-700 text-sm">
                Анализ LSI может занять несколько минут...
              </p>
            </div>
          )}

          {/* LSI Results */}
          {formattedLSIResults && !lsiLoading && (
            <LSIResults
              lsiResults={formattedLSIResults}
              selectedCompetitors={selectedCompetitors}
              mySiteAnalysis={mySiteAnalysis}
              results={combinedResults}
              medianMode={calculateByMedian}
              onKeywordsAnalysis={handleKeywordsAnalysis}
              keywordsLoading={keywordsLoading}
              keywordsProgress={keywordsProgress}
            />
          )}

          {/* Keywords Progress Bar */}
          {keywordsLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ProgressBar
                progress={keywordsProgress}
                label="Прогресс анализа ключевых слов"
                showPercentage={true}
                color="red"
                className="mb-2"
              />
              <p className="text-red-700 text-sm">
                Анализ ключевых слов может занять несколько минут...
              </p>
            </div>
          )}

          {/* Keywords Results */}
          {keywordsResults && !keywordsLoading && (
            <KeywordsResults
              keywordsData={keywordsResults.table}
              keywordsTotalWords={keywordsResults.total_words}
              searchEngine={keywordsResults.search_engine}
              onBack={() => {
                console.log("Back to previous step");
              }}
            />
          )}

          {/* БЛОК АНАЛИЗА КОЛЛОКАЦИЙ - В САМОМ КОНЦЕ СТРАНИЦЫ */}
          {/* Кнопка анализа коллокаций - показываем после Keywords анализа или LSI анализа */}
          {(keywordsResults || formattedLSIResults) && !lsiLoading && !keywordsLoading && !collocationLoading && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Семантический анализ (коллокации)
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Анализ слов, которые часто встречаются рядом с вашими целевыми фразами.
                    Поможет найти дополнительные LSI-слова и понять контекст использования.
                  </p>
                </div>
                  <CollocationAnalysisButton
                    pageUrl={results?.my_page?.url || pageUrl}
                    competitorUrls={selectedCompetitors}  // Добавляем выбранных конкурентов
                    mainQuery={mainQuery}
                    additionalQueries={additionalQueries}
                    lsiResults={lsiResults}
                    onStart={() => {
                      console.log('Начало анализа коллокаций');
                    }}
                    onSuccess={(data, originalPhrases) => {  // Обновляем для получения originalPhrases
                      console.log('Успешный анализ коллокаций:', data);
                      setCollocationResults(data);
                      setCollocationOriginalPhrases(originalPhrases);
                    }}
                    onError={(error) => {
                      console.error('Ошибка анализа коллокаций:', error);
                      alert(`Ошибка анализа: ${error}`);
                    }}
                    disabled={collocationLoading || lsiLoading || keywordsLoading}
                  />
              </div>
            </div>
          )}

          {/* Progress Bar для анализа коллокаций */}
          {collocationLoading && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <ProgressBar
                progress={collocationProgress}
                label="Анализ семантических связей"
                subLabel="Поиск коллокаций и PMI анализ..."
                showPercentage={true}
                color="purple"
                className="mb-2"
              />
              <p className="text-purple-700 text-sm">
                Анализ может занять несколько минут в зависимости от размера страницы...
              </p>
            </div>
          )}

          {/* Результаты анализа коллокаций */}
          {collocationResults && !collocationLoading && (
            <CollocationResultsDisplay
              data={collocationResults}
              originalPhrases={collocationOriginalPhrases}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzerPage;