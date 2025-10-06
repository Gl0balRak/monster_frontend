import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input, Textarea, Select, Checkbox, InputURL } from "@/components/forms";
import { Button, IconButton, ActionButton } from "@/components/buttons";
import { FileUpload } from "@/components/ui/FileUpload";
import {
  SortableTable,
  TableColumn,
  TableRow,
} from "@/components/tables/SortableTable.tsx";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { GroupSelectionDialog } from "@/components/ui/GroupSelectionDialog";
import { NewGroupDialog } from "@/components/ui/NewGroupDialog";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { colors, commonClasses, typography } from "@/lib/design-system";
import { useSemantics } from "@/hooks/useSemantics";
import { semantixApi, Region } from "@/lib/semantix-api";

const Semantix: React.FC = () => {
  // API интеграция
  const {
    keywords,
    isLoading,
    error,
    message,
    loadingStates,
    activeTasks,
    refreshKeywords,
    parseKeywords,
    cleanKeywords,
    parseSearchSuggestions,
    parseFrequencies,
    loadDemandAndClicks,
    checkCompetition,
    checkCommercialization,
    clusterKeywords,
    updateKeywordGroup,
    bulkUpdateKeywordGroup,
    clearKeywords,
    addManualKeywords,
    downloadShortTable,
    downloadFullTable,
  } = useSemantics();

  // Настройки парс��нга
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [competitors, setCompetitors] = useState([""]);
  const [region, setRegion] = useState("");
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
  const [selectedServices, setSelectedServices] = useState({
    keyso: false,
    bukvarix: false,
    yandexMetrika: false,
    yandexWebmaster: false,
    gsc: false,
  });

  // Ручное добавление запросов
  const [manualQueries, setManualQueries] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Настройки кластеризации
  const [searchEngine, setSearchEngine] = useState("yandex");
  const [groupingMethod, setGroupingMethod] = useState("hard");
  const [groupingDegree, setGroupingDegree] = useState("3");
  const [checkDepth, setCheckDepth] = useState("10");
  const [excludeMain, setExcludeMain] = useState(false);

  // Настройки выгрузки поисковых подсказок
  const [parsingMethod, setParsingMethod] = useState("phrase");
  const [suggestionsSearchEngine, setSuggestionsSearchEngine] =
    useState("yandex");
  const [parsingDepth, setParsingDepth] = useState("1");
  const [excludePorno, setExcludePorno] = useState(false);
  const [excludeNews, setExcludeNews] = useState(false);

  // Настройки чи��тки
  const [stopWords, setStopWords] = useState("");
  const [cityExclusions, setCityExclusions] = useState("");
  const [cleaningParams, setCleaningParams] = useState({
    duplicates: false,
    numbers: false,
    adult: false,
    stopWords: false,
    singleWords: false,
    citiesRF: false,
    latin: false,
    specialChars: false,
    wordRepeats: false,
  });
  const [allSelected, setAllSelected] = useState(false);

  // Настрой��и парсинга частот
  const [parseW, setParseW] = useState(false);
  const [parseNotW, setParseNotW] = useState(false);
  const [parseWQuoted, setParseWQuoted] = useState(false);

  // Управление таблице��
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("25");
  const [selectedTableRows, setSelectedTableRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );

  // Фильтры и поиск
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBasket, setShowBasket] = useState(true);
  const [filters, setFilters] = useState({
    relevantPage: "",
    group: "",
    positionFrom: "",
    positionTo: "",
    wFrom: "",
    wTo: "",
    wQuotesFrom: "",
    wQuotesTo: "",
    wNotFrom: "",
    wNotTo: "",
    demandFrom: "",
    demandTo: "",
    clicksFrom: "",
    clicksTo: "",
    competition: "",
    commerceFrom: "",
    commerceTo: "",
  });

  // Диалоги
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [groupSelectionDialog, setGroupSelectionDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: (group: string) => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [newGroupDialog, setNewGroupDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: (groupName: string) => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Загрузка регионов при монтировании + восстановление сохраненного региона
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await semantixApi.getRegions();
        if (response.success && response.regions.length > 0) {
          setAvailableRegions(response.regions);
          let savedRegion = "";
          try {
            const saved = localStorage.getItem("semantixForm");
            if (saved) {
              const parsed = JSON.parse(saved);
              savedRegion = parsed.region || "";
            }
          } catch {}
          if (savedRegion) {
            setRegion(savedRegion);
          } else {
            setRegion(response.regions[0].value);
          }
        }
      } catch (err) {
        console.error("Error loading regions:", err);
      }
    };

    loadRegions();
  }, []);

  // Инициализация значений из localStorage при открытии вкладки
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem("semantixForm");
      if (!savedStr) return;
      const saved = JSON.parse(savedStr);
      setWebsiteUrl(saved.websiteUrl || "");
      setCompetitors(
        Array.isArray(saved.competitors) && saved.competitors.length
          ? saved.competitors
          : [""],
      );
      if (saved.region) setRegion(saved.region);
      setManualQueries(saved.manualQueries || "");
      setSearchEngine(saved.searchEngine || "yandex");
      setGroupingMethod(saved.groupingMethod || "hard");
      setGroupingDegree(saved.groupingDegree || "3");
      setCheckDepth(saved.checkDepth || "10");
      setParsingMethod(saved.parsingMethod || "phrase");
      setSuggestionsSearchEngine(saved.suggestionsSearchEngine || "yandex");
      setParsingDepth(saved.parsingDepth || "1");
      setStopWords(saved.stopWords || "");
      setCityExclusions(saved.cityExclusions || "");
      setItemsPerPage(saved.itemsPerPage || "25");
      setSearchQuery(saved.searchQuery || "");
      if (saved.selectedServices)
        setSelectedServices({
          keyso: !!saved.selectedServices.keyso,
          bukvarix: !!saved.selectedServices.bukvarix,
          yandexMetrika: !!saved.selectedServices.yandexMetrika,
          yandexWebmaster: !!saved.selectedServices.yandexWebmaster,
          gsc: !!saved.selectedServices.gsc,
        });
      if (saved.cleaningParams)
        setCleaningParams({
          duplicates: !!saved.cleaningParams.duplicates,
          numbers: !!saved.cleaningParams.numbers,
          adult: !!saved.cleaningParams.adult,
          stopWords: !!saved.cleaningParams.stopWords,
          singleWords: !!saved.cleaningParams.singleWords,
          citiesRF: !!saved.cleaningParams.citiesRF,
          latin: !!saved.cleaningParams.latin,
          specialChars: !!saved.cleaningParams.specialChars,
          wordRepeats: !!saved.cleaningParams.wordRepeats,
        });
      if (typeof saved.allSelected === "boolean")
        setAllSelected(saved.allSelected);
      if (typeof saved.excludeMain === "boolean")
        setExcludeMain(saved.excludeMain);
      if (typeof saved.parseW === "boolean") setParseW(saved.parseW);
      if (typeof saved.parseNotW === "boolean") setParseNotW(saved.parseNotW);
      if (typeof saved.parseWQuoted === "boolean")
        setParseWQuoted(saved.parseWQuoted);
      if (typeof saved.excludePorno === "boolean")
        setExcludePorno(saved.excludePorno);
      if (typeof saved.excludeNews === "boolean")
        setExcludeNews(saved.excludeNews);
      if (typeof saved.showBasket === "boolean")
        setShowBasket(saved.showBasket);
      if (typeof saved.showFilters === "boolean")
        setShowFilters(saved.showFilters);
      if (saved.filters) {
        setFilters({
          relevantPage: saved.filters.relevantPage || "",
          group: saved.filters.group || "",
          positionFrom: saved.filters.positionFrom || "",
          positionTo: saved.filters.positionTo || "",
          wFrom: saved.filters.wFrom || "",
          wTo: saved.filters.wTo || "",
          wQuotesFrom: saved.filters.wQuotesFrom || "",
          wQuotesTo: saved.filters.wQuotesTo || "",
          wNotFrom: saved.filters.wNotFrom || "",
          wNotTo: saved.filters.wNotTo || "",
          demandFrom: saved.filters.demandFrom || "",
          demandTo: saved.filters.demandTo || "",
          clicksFrom: saved.filters.clicksFrom || "",
          clicksTo: saved.filters.clicksTo || "",
          competition: saved.filters.competition || "",
          commerceFrom: saved.filters.commerceFrom || "",
          commerceTo: saved.filters.commerceTo || "",
        });
      }
    } catch (e) {
      console.error("Failed to restore Semantix form from storage", e);
    }
  }, []);

  // Сохранение значений в localStorage при изменении
  useEffect(() => {
    const formState = {
      websiteUrl,
      competitors,
      region,
      manualQueries,
      searchEngine,
      groupingMethod,
      groupingDegree,
      checkDepth,
      parsingMethod,
      suggestionsSearchEngine,
      parsingDepth,
      stopWords,
      cityExclusions,
      itemsPerPage,
      searchQuery,
      filters,
      selectedServices,
      cleaningParams,
      allSelected,
      excludeMain,
      parseW,
      parseNotW,
      parseWQuoted,
      excludePorno,
      excludeNews,
      showBasket,
      showFilters,
    };
    try {
      localStorage.setItem("semantixForm", JSON.stringify(formState));
    } catch (e) {}
  }, [
    websiteUrl,
    competitors,
    region,
    manualQueries,
    searchEngine,
    groupingMethod,
    groupingDegree,
    checkDepth,
    parsingMethod,
    suggestionsSearchEngine,
    parsingDepth,
    stopWords,
    cityExclusions,
    itemsPerPage,
    searchQuery,
    filters,
    selectedServices,
    cleaningParams,
    allSelected,
    excludeMain,
    parseW,
    parseNotW,
    parseWQuoted,
    excludePorno,
    excludeNews,
    showBasket,
    showFilters,
  ]);

  // Основные функции
  const addCompetitor = () => {
    if (competitors.length < 10) {
      setCompetitors([...competitors, ""]);
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      const newCompetitors = competitors.filter((_, i) => i !== index);
      setCompetitors(newCompetitors);
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setSelectedServices((prev) => ({
      ...prev,
      [service]: checked,
    }));
  };

  const handleCleaningParamChange = (param: string, checked: boolean) => {
    setCleaningParams((prev) => ({
      ...prev,
      [param]: checked,
    }));
  };

  const toggleAllCleaning = () => {
    const newValue = !allSelected;
    setAllSelected(newValue);
    const updatedParams = Object.keys(cleaningParams).reduce(
      (acc, key) => ({
        ...acc,
        [key]: newValue,
      }),
      {} as typeof cleaningParams,
    );
    setCleaningParams(updatedParams);
  };

  // Ф��нкции для работы с фильтрами
  const resetFilters = () => {
    setFilters({
      relevantPage: "",
      group: "",
      positionFrom: "",
      positionTo: "",
      wFrom: "",
      wTo: "",
      wQuotesFrom: "",
      wQuotesTo: "",
      wNotFrom: "",
      wNotTo: "",
      demandFrom: "",
      demandTo: "",
      clicksFrom: "",
      clicksTo: "",
      competition: "",
      commerceFrom: "",
      commerceTo: "",
    });
    setSearchQuery("");
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleBasket = () => {
    setShowBasket(!showBasket);
  };

  // Получение выбранны�� серв��сов
  const getSelectedServices = () => {
    return Object.entries(selectedServices)
      .filter(([_, selected]) => selected)
      .map(([service, _]) => service)
      .join(",");
  };

  // Получение нас��роек чистки
  const getCleaningSettings = () => {
    return Object.entries(cleaningParams)
      .filter(([_, selected]) => selected)
      .map(([param, _]) => param)
      .join(",");
  };

  // Уникальные группы
  const uniqueGroups = useMemo(() => {
    const groups = new Set(keywords.map((k) => k.group).filter(Boolean));
    return ["Не корзина", ...Array.from(groups)];
  }, [keywords]);

  // Существующие группы для автокомплита (исключаем системные)
  const existingGroups = useMemo(() => {
    const groups = new Set(
      keywords
        .map((k) => k.group)
        .filter((g) => g && g !== "Корзина" && g !== "Не корзина"),
    );
    return Array.from(groups);
  }, [keywords]);

  // Количество запросов без корзины
  const totalNonBasket = useMemo(() => {
    return keywords.filter((k) => k.group !== "Корзина").length;
  }, [keywords]);

  // Стоимости операций
  const [operationCosts, setOperationCosts] = useState<Record<number, number | null>>({});

  useEffect(() => {
    const operationIds = [2, 3, 4, 5, 6, 7];
    let cancelled = false;
    Promise.all(
      operationIds.map(async (id) => {
        try {
          const res = await semantixApi.getOperationCost({ amount: totalNonBasket, operation_type: id });
          return [id, res.cost as number] as const;
        } catch {
          return [id, null] as const;
        }
      })
    ).then((pairs) => {
      if (cancelled) return;
      const map: Record<number, number | null> = {};
      pairs.forEach(([id, cost]) => {
        map[id] = cost;
      });
      setOperationCosts(map);
    });
    return () => {
      cancelled = true;
    };
  }, [totalNonBasket]);

  // Обработчики действий
  const handleParsing = () => {
    if (!websiteUrl || !region) {
      setConfirmDialog({
        open: true,
        title: "Ошибка",
        description: "Укажите адрес сайта и регион",
        onConfirm: () => {},
      });
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Подтвердите парсинг",
      description: "Вы уверены, что хотите запустить парсинг ключевых слов?",
      onConfirm: async () => {
        await parseKeywords({
          region,
          domain: websiteUrl,
          competitors: competitors.filter((c) => c.trim()).join(","),
          services: getSelectedServices(),
        });
      },
    });
  };

  const handleCleaning = () => {
    setConfirmDialog({
      open: true,
      title: "Подтвердите чистку",
      description:
        "Вы уверены, что хотите выполнить чистку ключевых слов согласно выбранным настройкам?",
      onConfirm: async () => {
        await cleanKeywords({
          region,
          domain: websiteUrl,
          cleaning_settings: getCleaningSettings(),
          stop_words: stopWords,
          exclude_cities: cityExclusions,
        });
      },
    });
  };

  const handleSearchSuggestions = () => {
    setGroupSelectionDialog({
      open: true,
      title: "Выберите группу",
      description: "К какой группе применить парсинг поисковых подсказок?",
      onConfirm: (selectedGroup) => {
        const groupKeywords =
          selectedGroup === "Не корзина"
            ? keywords.filter((k) => k.group !== "Корзина").length
            : keywords.filter((k) => k.group === selectedGroup).length;

        setConfirmDialog({
          open: true,
          title: "Подтвердите операцию",
          description: `Парсинг поисковых подсказок будет применен к группе "${selectedGroup}" (${groupKeywords} ключевых слов). Продолжить?`,
          onConfirm: async () => {
            await parseSearchSuggestions({
              region,
              domain: websiteUrl,
              target: selectedGroup,
              search_suggestions_method: mapParsingMethodToAPI(parsingMethod),
              search_suggestions_engine: suggestionsSearchEngine,
              search_suggestions_depth: parsingDepth,
              search_suggestions_exclude_porn: excludePorno.toString(),
              search_suggestions_exclude_news: excludeNews.toString(),
            });
          },
        });
      },
    });
  };

  const handleFrequencies = () => {
    if (!parseW && !parseNotW && !parseWQuoted) {
      setConfirmDialog({
        open: true,
        title: "Ошибка",
        description: "Выберите хотя бы один тип частоты",
        onConfirm: () => {},
      });
      return;
    }

    setGroupSelectionDialog({
      open: true,
      title: "Выберите группу",
      description: "К какой группе применить парсинг частот?",
      onConfirm: (selectedGroup) => {
        const groupKeywords =
          selectedGroup === "Не корзина"
            ? keywords.filter((k) => k.group !== "Корзина").length
            : keywords.filter((k) => k.group === selectedGroup).length;

        setConfirmDialog({
          open: true,
          title: "Подтвердите операцию",
          description: `Парсинг частот будет применен к группе "${selectedGroup}" (${groupKeywords} ключевых слов). Продолжить?`,
          onConfirm: async () => {
            await parseFrequencies({
              region,
              domain: websiteUrl,
              target: selectedGroup,
              competitors: competitors.filter((c) => c.trim()).join(","),
              parse_w: parseW.toString(),
              parse_not_w: parseNotW.toString(),
              parse_w_quoted: parseWQuoted.toString(),
            });
          },
        });
      },
    });
  };

  const handleDemandClicks = () => {
    setGroupSelectionDialog({
      open: true,
      title: "Выберите группу",
      description: "К какой группе применить загрузку спроса и кликов?",
      onConfirm: (selectedGroup) => {
        const groupKeywords =
          selectedGroup === "Не корзина"
            ? keywords.filter((k) => k.group !== "Корзина").length
            : keywords.filter((k) => k.group === selectedGroup).length;

        setConfirmDialog({
          open: true,
          title: "Подтвердите операцию",
          description: `Загрузка спроса и кликов будет применена к группе "${selectedGroup}" (${groupKeywords} ключевых слов). Продолжить?`,
          onConfirm: async () => {
            await loadDemandAndClicks({
              region,
              domain: websiteUrl,
              services: getSelectedServices(),
              target: selectedGroup,
            });
          },
        });
      },
    });
  };

  const handleCompetition = () => {
    setGroupSelectionDialog({
      open: true,
      title: "Выберите группу",
      description: "К какой группе применить проверку конкурентности?",
      onConfirm: (selectedGroup) => {
        const groupKeywords =
          selectedGroup === "Не корзина"
            ? keywords.filter((k) => k.group !== "Корзина").length
            : keywords.filter((k) => k.group === selectedGroup).length;

        setConfirmDialog({
          open: true,
          title: "Подтвердите операцию",
          description: `Проверка конкурентности будет применена к группе "${selectedGroup}" (${groupKeywords} ключевых слов). Продолжить?`,
          onConfirm: async () => {
            await checkCompetition({
              region,
              domain: websiteUrl,
              competitors: competitors.filter((c) => c.trim()).join(","),
              target: selectedGroup,
            });
          },
        });
      },
    });
  };

  const handleCommercialization = () => {
    setGroupSelectionDialog({
      open: true,
      title: "Выберите группу",
      description: "К какой группе применить проверку коммерциализации?",
      onConfirm: (selectedGroup) => {
        const groupKeywords =
          selectedGroup === "Не корзина"
            ? keywords.filter((k) => k.group !== "Корзина").length
            : keywords.filter((k) => k.group === selectedGroup).length;

        setConfirmDialog({
          open: true,
          title: "Подтвердите операцию",
          description: `Проверка коммерциализации будет применена к группе "${selectedGroup}" (${groupKeywords} ключевых слов). Продолжить?`,
          onConfirm: async () => {
            await checkCommercialization({
              region,
              domain: websiteUrl,
              target: selectedGroup,
            });
          },
        });
      },
    });
  };

  const handleClustering = () => {
    setConfirmDialog({
      open: true,
      title: "Подтвердите кластеризацию",
      description: `К кластеризации будет отправлено ${keywords.filter((k) => k.group !== "Корзина").length} ключевых слов. Продолжить?`,
      onConfirm: async () => {
        await clusterKeywords({
          region,
          domain: websiteUrl,
          grouping_method: groupingMethod,
          grouping_level: groupingDegree,
          check_depth: checkDepth,
          exclude_main: excludeMain.toString(),
          search_engine: searchEngine,
        });
      },
    });
  };

  const handleClearData = () => {
    setConfirmDialog({
      open: true,
      title: "Подтвердите удаление",
      description:
        "Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.",
      variant: "destructive",
      onConfirm: async () => {
        await clearKeywords();
      },
    });
  };

  const handleBulkGroupUpdate = () => {
    if (selectedTableRows.length === 0) {
      setConfirmDialog({
        open: true,
        title: "Ошибка",
        description: "Выберите строки для обновления",
        onConfirm: () => {},
      });
      return;
    }

    setNewGroupDialog({
      open: true,
      title: "Создание группы",
      description: `Введите название группы для ${selectedTableRows.length} выбранных строк:`,
      onConfirm: async (groupName) => {
        const rowIds = selectedTableRows.map((id) => parseInt(id));
        await bulkUpdateKeywordGroup(rowIds, groupName, region, websiteUrl);
        setSelectedTableRows([]);
      },
    });
  };

  const handleMoveToBasket = async () => {
    if (selectedTableRows.length === 0) {
      setConfirmDialog({
        open: true,
        title: "Ошибка",
        description: "Выберите строки для перемещения в корзину",
        onConfirm: () => {},
      });
      return;
    }

    const rowIds = selectedTableRows.map((id) => parseInt(id));
    await bulkUpdateKeywordGroup(rowIds, "Корзина", region, websiteUrl);
    setSelectedTableRows([]);
  };

  const handleAddQueries = () => {
    if (!manualQueries.trim() && !selectedFile) {
      setConfirmDialog({
        open: true,
        title: "Ошибка",
        description: "Введите ключевые слова или выберите файл",
        onConfirm: () => {},
      });
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Подтвердите добавление",
      description: "Вы уверены, что хотите добавить введенные ключевые слова?",
      onConfirm: async () => {
        let fileContent = "";
        let fileName = "";

        if (selectedFile) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result?.toString() || "";
              resolve(result.split(",")[1] || "");
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(selectedFile);
          });
          fileContent = base64;
          fileName = selectedFile.name;

          await addManualKeywords({
            region,
            domain: websiteUrl,
            keywords_text: manualQueries.trim() || undefined,
            file_content: fileContent || undefined,
            file_name: fileName || undefined,
          });

          setManualQueries("");
          setSelectedFile(null);
        } else {
          await addManualKeywords({
            region,
            domain: websiteUrl,
            keywords_text: manualQueries.trim(),
          });

          setManualQueries("");
        }
      },
    });
  };

  const handleDownloadShortTable = async () => {
    await downloadShortTable({
      region,
      domain: websiteUrl,
      competitors: competitors.filter((c) => c.trim()).join(","),
      services: getSelectedServices(),
      stop_words: stopWords,
    });
  };

  const handleDownloadFullTable = async () => {
    await downloadFullTable({
      region,
      domain: websiteUrl,
      competitors: competitors.filter((c) => c.trim()).join(","),
      services: getSelectedServices(),
      stop_words: stopWords,
      words_count: 500, // default value
    });
  };

  // Конвертация данных для таблицы
  const tableColumns: TableColumn[] = [
    {
      key: "query",
      label: "Запрос",
      sortable: true,
      sortType: "string",
      tooltip: "Поисковая фраза или ключевое слово",
    },
    {
      key: "relevantPage",
      label: "Релевантная страница",
      sortable: true,
      sortType: "string",
      tooltip: "URL страницы сайта, наиболее подходящей для данного запроса",
    },
    {
      key: "group",
      label: "Группа",
      sortable: true,
      sortType: "string",
      tooltip:
        "Тематическая группа запросов для удобной организации семантического ядра",
    },
    {
      key: "position",
      label: "Позиция",
      sortable: true,
      sortType: "number",
      tooltip: "Текущая позиция сайта в поисковой выдаче по данному запросу",
    },
    {
      key: "w",
      label: "W",
      sortable: true,
      sortType: "number",
      tooltip: "Количество запросов в месяц (частотность) в Яндекс.Вордстат",
    },
    {
      key: "wQuotes",
      label: '"W"',
      sortable: true,
      sortType: "number",
      tooltip: "Точная частотность запроса в кавычках в Яндекс.Вордстат",
    },
    {
      key: "wNot",
      label: "!W",
      sortable: true,
      sortType: "number",
      tooltip:
        "Частотность с оператором ! (фиксированный порядок слов) в Яндекс.Вордстат",
    },
    {
      key: "demand",
      label: "Спрос",
      sortable: true,
      sortType: "number",
      tooltip: "Количество показов по данному запросу в месяц",
    },
    {
      key: "clicks",
      label: "Клики",
      sortable: true,
      sortType: "number",
      tooltip: "Примерное количество кликов по запросу в месяц",
    },
    {
      key: "competition",
      label: "Конкурентность",
      sortable: true,
      sortType: "competition",
      tooltip:
        "Уровень конкуренции по данному запросу (Низкая/Умеренная/Высокая)",
    },
    {
      key: "commerce",
      label: "Коммерция",
      sortable: true,
      sortType: "number",
      tooltip: "Показатель коммерческой направленности запроса в процентах",
    },
  ];

  const tableRows: TableRow[] = keywords.map((keyword) => ({
    id: keyword.id.toString(),
    query: keyword.query,
    relevantPage: keyword.relevant_page || "/",
    group: keyword.group || "Без группы",
    position: keyword.position?.toString() || "0",
    w: keyword.w?.toString() || "0",
    wQuotes: keyword.w_quoted?.toString() || "0",
    wNot: keyword.not_w?.toString() || "0",
    demand: keyword.demand?.toString() || "0",
    clicks: keyword.clicks?.toString() || "0",
    competition: keyword.competition || "Нет данных",
    commerce: keyword.commerce ? `${keyword.commerce}%` : "0%",
  }));

  // Фильтрац���я таблицы
  const filteredTableRows = useMemo(() => {
    let filtered = [...tableRows];

    // Фильтр по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.query.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Фильтр корзины
    if (!showBasket) {
      filtered = filtered.filter((row) => row.group !== "Корзина");
    }

    // Применение текстовых фильтров
    if (filters.relevantPage) {
      filtered = filtered.filter((row) =>
        row.relevantPage
          .toLowerCase()
          .includes(filters.relevantPage.toLowerCase()),
      );
    }

    if (filters.group) {
      filtered = filtered.filter((row) =>
        row.group.toLowerCase().includes(filters.group.toLowerCase()),
      );
    }

    if (filters.competition) {
      filtered = filtered.filter(
        (row) => row.competition === filters.competition,
      );
    }

    // Применение числовых фильтров
    const applyNumericFilter = (value: string, from: string, to: string) => {
      const numValue = parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
      const fromNum = from ? parseFloat(from) : Number.MIN_SAFE_INTEGER;
      const toNum = to ? parseFloat(to) : Number.MAX_SAFE_INTEGER;
      return numValue >= fromNum && numValue <= toNum;
    };

    if (filters.positionFrom || filters.positionTo) {
      filtered = filtered.filter((row) =>
        applyNumericFilter(
          row.position,
          filters.positionFrom,
          filters.positionTo,
        ),
      );
    }

    if (filters.wFrom || filters.wTo) {
      filtered = filtered.filter((row) =>
        applyNumericFilter(row.w, filters.wFrom, filters.wTo),
      );
    }

    if (filters.wQuotesFrom || filters.wQuotesTo) {
      filtered = filtered.filter((row) =>
        applyNumericFilter(row.wQuotes, filters.wQuotesFrom, filters.wQuotesTo),
      );
    }

    if (filters.wNotFrom || filters.wNotTo) {
      filtered = filtered.filter((row) =>
        applyNumericFilter(row.wNot, filters.wNotFrom, filters.wNotTo),
      );
    }

    if (filters.demandFrom || filters.demandTo) {
      filtered = filtered.filter((row) =>
        applyNumericFilter(row.demand, filters.demandFrom, filters.demandTo),
      );
    }

    if (filters.clicksFrom || filters.clicksTo) {
      filtered = filtered.filter((row) =>
        applyNumericFilter(row.clicks, filters.clicksFrom, filters.clicksTo),
      );
    }

    if (filters.commerceFrom || filters.commerceTo) {
      filtered = filtered.filter((row) =>
        applyNumericFilter(
          row.commerce,
          filters.commerceFrom,
          filters.commerceTo,
        ),
      );
    }

    return filtered;
  }, [tableRows, searchQuery, showBasket, filters]);

  // Sorted table rows
  const sortedTableRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredTableRows;

    const column = tableColumns.find((col) => col.key === sortColumn);
    const sortType = column?.sortType || "string";

    return [...filteredTableRows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let result = 0;

      if (sortType === "number") {
        const aNum = parseFloat(String(aValue).replace(/[^\d.-]/g, "")) || 0;
        const bNum = parseFloat(String(bValue).replace(/[^\d.-]/g, "")) || 0;
        result = aNum - bNum;
      } else if (sortType === "competition") {
        const competitionOrder = {
          Низкая: 1,
          Умеренная: 2,
          Высокая: 3,
          "Нет данных": 0,
        };
        const aOrder =
          competitionOrder[aValue as keyof typeof competitionOrder] || 0;
        const bOrder =
          competitionOrder[bValue as keyof typeof competitionOrder] || 0;
        result = aOrder - bOrder;
      } else {
        const aStr = String(aValue);
        const bStr = String(bValue);
        result = aStr.localeCompare(bStr);
      }

      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredTableRows, sortColumn, sortDirection, tableColumns]);

  // Paginated table rows
  const paginatedTableRows = useMemo(() => {
    const itemsPerPageNum = parseInt(itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPageNum;
    const endIndex = startIndex + itemsPerPageNum;
    return sortedTableRows.slice(startIndex, endIndex);
  }, [sortedTableRows, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = useMemo(() => {
    const itemsPerPageNum = parseInt(itemsPerPage);
    return Math.ceil(sortedTableRows.length / itemsPerPageNum);
  }, [sortedTableRows.length, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedTableRows.length]);

  // Handle table sorting
  const handleSort = (columnKey: string) => {
    const column = tableColumns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Генерация ссылки на Ahrefs
  const generateAhrefsLink = () => {
    const targetSite = websiteUrl || "example.com";
    return `https://app.ahrefs.com/v2-site-explorer/organic-keywords?brandedMode=all&chartGranularity=daily&chartInterval=year2&compareDate=dontCompare&country=allByLocation&currentDate=today&hiddenColumns=AllIntents%7C%7CCPC%7C%7CKD%7C%7CLastUpdated%7C%7COrganicTraffic%7C%7COtherIntents%7C%7CPaidTraffic%7C%7CPosition%7C%7CPositionHistory%7C%7CSERP%7C%7CSF%7C%7CURL%7C%7CUserIntents%7C%7CVolume&intentsAttrs=&keywordRules=&limit=100&localMode=all&mainOnly=0&mode=subdomains&multipleUrlsOnly=0&offset=0&performanceChartTopPosition=top11_20%7C%7Ctop21_50%7C%7Ctop3%7C%7Ctop4_10%7C%7Ctop51&positionChanges=&sort=OrganicTrafficInitial&sortDirection=desc&target=${encodeURIComponent(targetSite)}&urlRules=&volume_type=monthly`;
  };

  // Маппинг значений метода парсинга для API
  const mapParsingMethodToAPI = (method: string): string => {
    const mapping: { [key: string]: string } = {
      phrase: "nrm",
      phrase_space: "spc",
      phrase_en: "lat",
      phrase_ru: "cyr",
      phrase_numbers: "dig",
    };
    return mapping[method] || "nrm";
  };



  return (
    <div className="flex-1 bg-gray-0 p-6">
      <div className="w-full">
        {/* Заголовок страницы */}
        {/*<div className="border-b pb-4">*/}
        {/*  <h1 className="text-2xl font-bold text-gray-900">Семантикс</h1>*/}
        {/*  <p className="text-gray-600 mt-1">*/}
        {/*    Сбор семантического ядра*/}
        {/*  </p>*/}
        {/*</div>*/}

        {/* Диалоги */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog((prev) => ({ ...prev, open }))
          }
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          variant={confirmDialog.variant}
        />

        <GroupSelectionDialog
          open={groupSelectionDialog.open}
          onOpenChange={(open) =>
            setGroupSelectionDialog((prev) => ({ ...prev, open }))
          }
          title={groupSelectionDialog.title}
          description={groupSelectionDialog.description}
          groups={uniqueGroups}
          onConfirm={groupSelectionDialog.onConfirm}
        />

        <NewGroupDialog
          open={newGroupDialog.open}
          onOpenChange={(open) =>
            setNewGroupDialog((prev) => ({ ...prev, open }))
          }
          title={newGroupDialog.title}
          description={newGroupDialog.description}
          onConfirm={newGroupDialog.onConfirm}
          existingGroups={existingGroups}
        />

        {/*/!* От��бражение активных задач *!/*/}
        {/*{activeTasks.length > 0 && (*/}
        {/*  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">*/}
        {/*    <h3 className={cn(typography.fieldLabel, "mb-3")}>*/}
        {/*      Активные задачи:*/}
        {/*    </h3>*/}
        {/*    {activeTasks.map((task) => (*/}
        {/*      <div key={task.id} className="mb-2">*/}
        {/*        <div className="flex justify-between items-center mb-1">*/}
        {/*          <span className={cn(typography.bodyText)}>{task.name}</span>*/}
        {/*          <span className={cn(typography.bodyText)}>*/}
        {/*            {task.progress}%*/}
        {/*          </span>*/}
        {/*        </div>*/}
        {/*        <ProgressBar progress={task.progress} color="red" />*/}
        {/*      </div>*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*)}*/}

        {/* 1. Блок «Настройки парсинга» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, "mb-6")}>
            Настройки парсинга
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <InputURL
              type="url"
              label="Адрес сайта"
              required
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={setWebsiteUrl}
              autoProtocol={true}// Включаем автоматическое добавление протокола
            />
            <Select
              label="Регион"
              value={region}
              onChange={setRegion}
              options={availableRegions.map((r) => ({
                value: r.value,
                label: r.label,
              }))}
            />
          </div>

          <div className="mb-6">
            <h3 className={cn(typography.fieldLabel, "mb-4")}>
              Конкуренты (до 10 сайтов)
            </h3>
            <div className="space-y-3">
              {competitors.map((competitor, index) => (
                <div key={index} className="flex gap-2 lg:w-1/2">
                  <div className="flex-1">
                    <InputURL
                      type="url"
                      placeholder={`https://competitor${index + 1}.com`}
                      value={competitor}
                      onChange={(value) => updateCompetitor(index, value)}
                      autoProtocol={true}// Включаем автоматическое добавление протокола
                    />
                  </div>
                  {competitors.length > 1 && (
                    <IconButton
                      variant="outline"
                      size="medium"
                      onClick={() => removeCompetitor(index)}
                      icon={
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      }
                    />
                  )}
                </div>
              ))}
              {competitors.length < 10 && (
                <button
                  onClick={addCompetitor}
                  className={cn(
                    "text-red-9 font-normal text-base hover:text-red-700",
                    commonClasses.font,
                  )}
                >
                  + Добавить конкурента
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className={cn(typography.fieldLabel, "mb-4")}>
              Сервисы для сбора семантики
            </h3>
            <div className="flex flex-wrap gap-6">
              <Checkbox
                label="Keys.so"
                checked={selectedServices.keyso}
                onChange={(checked) => handleServiceChange("keyso", checked)}
              />
              <Checkbox
                label="Букварикс"
                checked={selectedServices.bukvarix}
                onChange={(checked) => handleServiceChange("bukvarix", checked)}
              />
              <Checkbox
                label="Яндекс.Метрика (необходима авторизация)"
                checked={selectedServices.yandexMetrika}
                onChange={(checked) =>
                  handleServiceChange("yandexMetrika", checked)
                }
              />
              <Checkbox
                label="Яндекс.Вебмастер (необходима авторизация)"
                checked={selectedServices.yandexWebmaster}
                onChange={(checked) =>
                  handleServiceChange("yandexWebmaster", checked)
                }
              />
              <Checkbox
                label="GSC (Необходима авторизация)"
                checked={selectedServices.gsc}
                onChange={(checked) => handleServiceChange("gsc", checked)}
              />
              <div className="flex items-center">
                <a
                  href={generateAhrefsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-red-9 font-normal text-base hover:text-red-700 hover:underline transition-colors",
                    commonClasses.font,
                  )}
                >
                  Ahrefs
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Блок «Ручное добавление запросов» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, "mb-6")}>
            Ручное добавление запросов
          </h2>

          <div className="space-y-6">
            <div>
              <label
                className={cn(
                  "text-base font-normal text-black block mb-2",
                  commonClasses.font,
                )}
              >
                Запросы (через запятую или по одному в строке):
              </label>
              <Textarea
                placeholder="купить телефон, смартфон, цена мобильный телефон, планшет, ноутбук"
                value={manualQueries}
                onChange={setManualQueries}
                rows={4}
              />
            </div>

            <div>
              <h3 className={cn(typography.fieldLabel, "mb-3")}>
                Загрузить из файла (.xlsx, .csv):
              </h3>
              <FileUpload
                onFileSelect={setSelectedFile}
                acceptedTypes=".xlsx,.csv"
                selectedFileName={selectedFile?.name}
              />
            </div>

            <Button
              variant="filled"
              size="large"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              onClick={handleAddQueries}
              disabled={loadingStates.addManual}
            >
              {loadingStates.addManual ? "Добавление..." : "+ Добавить запросы"}
            </Button>
          </div>
        </div>

        {/* 3. Блок «Настройки кластеризации» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, "mb-6")}>
            Настройки кластеризации
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <Select
              label="Поисковая система"
              value={searchEngine}
              onChange={setSearchEngine}
              options={[
                { value: "yandex", label: "Яндекс" },
                { value: "google", label: "Google" },
              ]}
            />
            <Select
              label="Метод группировки"
              value={groupingMethod}
              onChange={setGroupingMethod}
              options={[
                { value: "hard", label: "Хард (для коммерции)" },
                { value: "soft", label: "Софт (для инфо)" },
              ]}
            />
            <Select
              label="Степень группировки (2-10)"
              value={groupingDegree}
              onChange={setGroupingDegree}
              options={[
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5", label: "5" },
                { value: "6", label: "6" },
                { value: "7", label: "7" },
                { value: "8", label: "8" },
                { value: "9", label: "9" },
                { value: "10", label: "10" },
              ]}
            />
            <Select
              label="Глубина проверки"
              value={checkDepth}
              onChange={setCheckDepth}
              options={[
                { value: "10", label: "Топ 10" },
                { value: "20", label: "Топ 20" },
                { value: "30", label: "Топ 30" },
              ]}
            />
          </div>

          <Checkbox
            label="Исключить главные"
            checked={excludeMain}
            onChange={setExcludeMain}
          />
        </div>

        {/* 4. Блок «Настройки выгрузки поисковых подсказок» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, "mb-6")}>
            Настройки выгрузки поисковых подсказок
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Select
              label="Метод парсинга"
              value={parsingMethod}
              onChange={setParsingMethod}
              options={[
                { value: "phrase", label: "Фраза" },
                { value: "phrase_space", label: "Фраза и пробел" },
                {
                  value: "phrase_en",
                  label: "Фраза и английский алфавит [a-z]",
                },
                { value: "phrase_ru", label: "Фраза и русский алфавит [а-я]" },
                { value: "phrase_numbers", label: "Фраза и цифры [0-9]" },
              ]}
            />
            <Select
              label="Поисковая система"
              value={suggestionsSearchEngine}
              onChange={setSuggestionsSearchEngine}
              options={[
                { value: "yandex", label: "Яндекс" },
                { value: "google", label: "Google" },
              ]}
            />
            <Select
              label="Глубина парсинга"
              value={parsingDepth}
              onChange={setParsingDepth}
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
              ]}
            />
          </div>

          <div className="space-y-3">
            <Checkbox
              label="Исключить порно-подсказки"
              checked={excludePorno}
              onChange={setExcludePorno}
            />
            <Checkbox
              label="Исключить новостные подсказки"
              checked={excludeNews}
              onChange={setExcludeNews}
            />
          </div>
        </div>

        {/* 5. Блок «Настройки парсинга частот» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, "mb-6")}>
            Настройки парсинга частот
          </h2>

          <div className="flex flex-wrap gap-6">
            <Checkbox
              label="Парсить W (широкое вхождение)"
              checked={parseW}
              onChange={setParseW}
            />
            <Checkbox
              label="Парсить !W (точная форма)"
              checked={parseNotW}
              onChange={setParseNotW}
            />
            <Checkbox
              label='Парсить "W" (точное вхождение)'
              checked={parseWQuoted}
              onChange={setParseWQuoted}
            />
          </div>
        </div>

        {/* 6. Блок «��астройки чистки» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, "mb-6")}>
            Настройки чистки
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Textarea
              label="Стоп-слова"
              placeholder="Введите стоп-слова через запятую или с новой строки"
              value={stopWords}
              onChange={setStopWords}
              rows={4}
            />
            <Textarea
              label="Исключение городов"
              placeholder="Введите города для исключения через запятую или с новой строки. Эти города не будут исключаться при выборе параметра чистки «Города РФ». Например, если вы хотите, чтобы были исключены все города, кроме Санкт-Петербурга, то в этом поле укажите Санкт-Петербург, а также все подходящие формы его названия, например: «Санкт-Петербург, СПб»."
              value={cityExclusions}
              onChange={setCityExclusions}
              rows={4}
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn(typography.fieldLabel)}>
                Параметры очистки результатов парсинга
              </h3>
              <Button
                variant="outline"
                size="medium"
                onClick={toggleAllCleaning}
              >
                {allSelected ? "Снять все" : "Выбрать все"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Checkbox
                label="Дубли (удаляет полные дубли фраз)"
                checked={cleaningParams.duplicates}
                onChange={(checked) =>
                  handleCleaningParamChange("duplicates", checked)
                }
              />
              <Checkbox
                label="Цифры (удаляет фразы с цифрами)"
                checked={cleaningParams.numbers}
                onChange={(checked) =>
                  handleCleaningParamChange("numbers", checked)
                }
              />
              <Checkbox
                label="18+ (удаляет adult контент)"
                checked={cleaningParams.adult}
                onChange={(checked) =>
                  handleCleaningParamChange("adult", checked)
                }
              />
              <Checkbox
                label="Стоп-слова (поиск вхождения)"
                checked={cleaningParams.stopWords}
                onChange={(checked) =>
                  handleCleaningParamChange("stopWords", checked)
                }
              />
              <Checkbox
                label="Однословники (удаляет фразы из 1 слова)"
                checked={cleaningParams.singleWords}
                onChange={(checked) =>
                  handleCleaningParamChange("singleWords", checked)
                }
              />
              <Checkbox
                label="Города РФ (чистка по городам России)"
                checked={cleaningParams.citiesRF}
                onChange={(checked) =>
                  handleCleaningParamChange("citiesRF", checked)
                }
              />
              <Checkbox
                label="Латиница (удаляет фразы с латиницей)"
                checked={cleaningParams.latin}
                onChange={(checked) =>
                  handleCleaningParamChange("latin", checked)
                }
              />
              <Checkbox
                label="Прочие символы (знаки препинания)"
                checked={cleaningParams.specialChars}
                onChange={(checked) =>
                  handleCleaningParamChange("specialChars", checked)
                }
              />
              <Checkbox
                label="Повторы слов (статистика по повторам)"
                checked={cleaningParams.wordRepeats}
                onChange={(checked) =>
                  handleCleaningParamChange("wordRepeats", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* 7. Панель действий */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="grid grid-cols-1 min-[943px]:grid-cols-2 min-[1216px]:grid-cols-3 min-[1473px]:grid-cols-4 gap-3">
            <div className="min-[943px]:col-span-2 min-[1216px]:col-span-1 grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <ActionButton
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  color="red"
                  onClick={handleParsing}
                  disabled={loadingStates.parsing}
                  className="h-12"
                >
                  {loadingStates.parsing ? "Парсинг..." : "Парсинг"}
                </ActionButton>
                <span className={cn(typography.helperText, "mt-1")}>0 л.</span>
              </div>
              <div className="flex flex-col">
                <ActionButton
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2L3 7v11a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V7l-7-5z" />
                    </svg>
                  }
                  color="purple"
                  onClick={handleCleaning}
                  disabled={loadingStates.cleaning}
                  className="h-12"
                >
                  {loadingStates.cleaning ? "Чистка..." : "Чистка"}
                </ActionButton>
                <span className={cn(typography.helperText, "mt-1")}>0 л.</span>
              </div>
            </div>
            <div className="flex flex-col">
              <ActionButton
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                }
                color="green"
                onClick={handleSearchSuggestions}
                disabled={loadingStates.searchSuggestions}
                className="h-12"
              >
                {loadingStates.searchSuggestions ? "Выгрузка..." : "Выгрузить поисковые подсказки"}
              </ActionButton>
              <span className={cn(typography.helperText, "mt-1")}>{operationCosts[4] != null ? `${operationCosts[4]} л.` : "0 л."}</span>
            </div>

            <div className="flex flex-col">
              <ActionButton
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                }
                color="darkBlue"
                onClick={handleFrequencies}
                disabled={loadingStates.frequencies}
                className="h-12"
              >
                {loadingStates.frequencies ? "Парсинг..." : "Парсинг частот"}
              </ActionButton>
              <span className={cn(typography.helperText, "mt-1")}>{operationCosts[2] != null ? `${operationCosts[2]} л.` : "0 л."}</span>
            </div>

            <div className="flex flex-col">
              <ActionButton
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                }
                color="cyan"
                onClick={handleDemandClicks}
                disabled={loadingStates.demandClicks}
                className="h-12"
              >
                {loadingStates.demandClicks ? "Загрузка..." : "Загрузка спроса и кликов"}
              </ActionButton>
              <span className={cn(typography.helperText, "mt-1")}>{operationCosts[3] != null ? `${operationCosts[3]} л.` : "0 л."}</span>
            </div>

            <div className="flex flex-col">
              <ActionButton
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                }
                color="orange"
                onClick={handleCompetition}
                disabled={loadingStates.competition}
                className="h-12"
              >
                {loadingStates.competition ? "Проверка..." : "Проверка конкурентности"}
              </ActionButton>
              <span className={cn(typography.helperText, "mt-1")}>{operationCosts[5] != null ? `${operationCosts[5]} л.` : "0 л."}</span>
            </div>

            <div className="flex flex-col">
              <ActionButton
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                color="pink"
                onClick={handleCommercialization}
                disabled={loadingStates.commercialization}
                className="h-12"
              >
                {loadingStates.commercialization ? "Проверка..." : "Проверка коммерциализации"}
              </ActionButton>
              <span className={cn(typography.helperText, "mt-1")}>{operationCosts[6] != null ? `${operationCosts[6]} л.` : "0 л."}</span>
            </div>

            <div className="flex flex-col">
              <ActionButton
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                color="teal"
                onClick={handleClustering}
                disabled={loadingStates.clustering}
                className="h-12"
              >
                {loadingStates.clustering ? "Кластеризация..." : "Кластеризация"}
              </ActionButton>
              <span className={cn(typography.helperText, "mt-1")}>{operationCosts[7] != null ? `${operationCosts[7]} л.` : "0 л."}</span>
            </div>

            <ActionButton
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              color="red"
              onClick={handleClearData}
              disabled={false}
              className="h-12"
            >
              Очистить все данные
            </ActionButton>

            <ActionButton
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              color="blue"
              onClick={handleDownloadShortTable}
              disabled={loadingStates.downloadShort}
              className="h-12"
            >
              {loadingStates.downloadShort ? "Скачивание..." : "Выгрузить сокращенную таблицу"}
            </ActionButton>

            <ActionButton
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              color="emerald"
              onClick={handleDownloadFullTable}
              disabled={loadingStates.downloadFull}
              className="h-12"
            >
              {loadingStates.downloadFull ? "Скачивание..." : "Выгрузить всю таблицу"}
            </ActionButton>
          </div>

          {/* Сообщения об ошибках и успехе */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
              <p className={cn(typography.bodyText, "text-red-700")}>{error}</p>
            </div>
          )}
          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
              <p className={cn(typography.bodyText, "text-green-700")}>
                {message}
              </p>
            </div>
          )}

          {/* Активные задачи */}
          {activeTasks.length > 0 && (
            <div className="bg-white rounded-lg p-6 mt-4">
              <h3 className={cn(typography.fieldLabel, "mb-4")}>
                Активные задачи:
              </h3>
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <div key={task.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={cn(typography.bodyText, "font-medium")}>
                        {task.name}
                      </span>
                      <span className={cn(typography.bodyText, "text-gray-600")}>
                        {task.progress}%
                      </span>
                    </div>
                    <ProgressBar progress={task.progress} color="red" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 8. Блок «Управление таблицей» */}
        <div className="bg-white rounded-lg p-6">
          <h2 className={cn(typography.blockTitle, "mb-4")}>
            Управление таблицей
          </h2>

          <div className="space-y-4 mb-6">
            {/* Первый ря��: поиск и основные кнопки */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[250px]">
                <Input
                  placeholder="Поиск по запросу..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  rightIcon={
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                />
              </div>

              <Button
                variant="outline"
                size="medium"
                className="bg-white text-black border-gray-300"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.628 1.601C2.22 1.601 1.89 1.93 1.89 2.334v1.98c0 .172.06.337.169.465l4.436 5.209v6.781c0 .14.047.278.133.39.173.225.499.264.728.091l2.963-2.226c.197-.148.314-.381.314-.629V9.988l4.436-5.209c.108-.128.169-.293.169-.465v-1.98c0-.404-.331-.735-.735-.735H2.628zM3.628 3.335h12.744v1.09L12.2 9.013c-.108.127-.169.292-.169.464v5.423l-1.963 1.472V9.477c0-.172-.06-.337-.169-.464L5.628 4.425v-1.09z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Фильтры
              </Button>

              <Button
                variant="outline"
                size="medium"
                className="bg-gray-200 text-black border-gray-300"
                onClick={resetFilters}
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Сбросить
              </Button>
            </div>

            {/* Второй ряд: действия с выбранными */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="medium"
                className="bg-white text-black border-gray-300"
                onClick={toggleBasket}
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                }
              >
                {showBasket ? "Скрыть корзину" : "Показать корзину"}
              </Button>

              <Button
                variant="outline"
                size="medium"
                className="bg-white text-black border-gray-300"
                onClick={handleMoveToBasket}
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                В корзину ({selectedTableRows.length})
              </Button>

              <Button
                variant="outline"
                size="medium"
                className="bg-white text-black border-gray-300"
                onClick={handleBulkGroupUpdate}
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                }
              >
                В группу ({selectedTableRows.length})
              </Button>
            </div>
          </div>

          {/* Панель фильтров */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
              <h3 className={cn(typography.fieldLabel, "mb-4")}>
                Фильтры по столбцам
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Релевантная страница"
                  placeholder="Введите страницу..."
                  value={filters.relevantPage}
                  onChange={(value) =>
                    handleFilterChange("relevantPage", value)
                  }
                />
                <AutocompleteInput
                  label="Группа"
                  placeholder="Фильтр..."
                  value={filters.group}
                  onChange={(value) => handleFilterChange("group", value)}
                  suggestions={existingGroups}
                />
                <div className="space-y-2">
                  <label className={cn(typography.fieldLabel)}>Позиция</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="От"
                      value={filters.positionFrom}
                      onChange={(value) =>
                        handleFilterChange("positionFrom", value)
                      }
                    />
                    <Input
                      placeholder="До"
                      value={filters.positionTo}
                      onChange={(value) =>
                        handleFilterChange("positionTo", value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={cn(typography.fieldLabel)}>W</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="От"
                      value={filters.wFrom}
                      onChange={(value) => handleFilterChange("wFrom", value)}
                    />
                    <Input
                      placeholder="До"
                      value={filters.wTo}
                      onChange={(value) => handleFilterChange("wTo", value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={cn(typography.fieldLabel)}>"W"</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="От"
                      value={filters.wQuotesFrom}
                      onChange={(value) =>
                        handleFilterChange("wQuotesFrom", value)
                      }
                    />
                    <Input
                      placeholder="До"
                      value={filters.wQuotesTo}
                      onChange={(value) =>
                        handleFilterChange("wQuotesTo", value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={cn(typography.fieldLabel)}>!W</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="От"
                      value={filters.wNotFrom}
                      onChange={(value) =>
                        handleFilterChange("wNotFrom", value)
                      }
                    />
                    <Input
                      placeholder="До"
                      value={filters.wNotTo}
                      onChange={(value) => handleFilterChange("wNotTo", value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={cn(typography.fieldLabel)}>Спрос</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="От"
                      value={filters.demandFrom}
                      onChange={(value) =>
                        handleFilterChange("demandFrom", value)
                      }
                    />
                    <Input
                      placeholder="До"
                      value={filters.demandTo}
                      onChange={(value) =>
                        handleFilterChange("demandTo", value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={cn(typography.fieldLabel)}>Клики</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="От"
                      value={filters.clicksFrom}
                      onChange={(value) =>
                        handleFilterChange("clicksFrom", value)
                      }
                    />
                    <Input
                      placeholder="До"
                      value={filters.clicksTo}
                      onChange={(value) =>
                        handleFilterChange("clicksTo", value)
                      }
                    />
                  </div>
                </div>
                <Select
                  label="Конкурентность"
                  value={filters.competition}
                  onChange={(value) => handleFilterChange("competition", value)}
                  options={[
                    { value: "", label: "Все" },
                    { value: "Низкая", label: "Низкая" },
                    { value: "Умеренная", label: "Умеренная" },
                    { value: "Высокая", label: "Высокая" },
                  ]}
                />
                <div className="space-y-2">
                  <label className={cn(typography.fieldLabel)}>
                    Коммерция (%)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="От"
                      value={filters.commerceFrom}
                      onChange={(value) =>
                        handleFilterChange("commerceFrom", value)
                      }
                    />
                    <Input
                      placeholder="До"
                      value={filters.commerceTo}
                      onChange={(value) =>
                        handleFilterChange("commerceTo", value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Таблица */}
          <SortableTable
            columns={tableColumns}
            rows={paginatedTableRows}
            allRows={sortedTableRows}
            selectedRows={selectedTableRows}
            onRowSelectionChange={setSelectedTableRows}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {/* Пагинация */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <span className={cn(typography.bodyText)}>Показать по:</span>
              <div className="min-w-[80px]">
                <Select
                  value={itemsPerPage}
                  onChange={setItemsPerPage}
                  options={[
                    { value: "25", label: "25" },
                    { value: "50", label: "50" },
                    { value: "100", label: "100" },
                    { value: "500", label: "500" },
                  ]}
                />
              </div>
              <span className={cn(typography.bodyText)}>строк на странице</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="medium"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Назад
              </Button>
              <div
                className={cn(
                  "flex items-center justify-center min-w-[60px] px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded",
                  commonClasses.font,
                )}
              >
                {currentPage} из {totalPages}
              </div>
              <Button
                variant="outline"
                size="medium"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                rightIcon={
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Вперед
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">

      </div>
    </div>
  );
};

export default Semantix;
