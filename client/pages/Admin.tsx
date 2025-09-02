import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import { buildUrl, API_CONFIG } from "@/config/api.config.ts";
import { Toaster } from "@/components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface YandexAccount {
  id: number;
  login: string;
  password: string;
  security_answer: string;
  status?: "active" | "error" | "warning";
}

interface DirectAccount {
  id: number;
  token: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [webmasterAccounts, setWebmasterAccounts] = useState<YandexAccount[]>(
    [],
  );
  const [directAccounts, setDirectAccounts] = useState<DirectAccount[]>([]);

  // Form states for adding new accounts
  const [newWebmasterAccount, setNewWebmasterAccount] = useState({
    login: "",
    password: "",
    security_answer: "",
  });

  const [newDirectAccount, setNewDirectAccount] = useState({
    token: "",
  });

  const [isLoadingWebmaster, setIsLoadingWebmaster] = useState(false);
  const [isLoadingDirect, setIsLoadingDirect] = useState(false);

  // Load existing accounts on component mount
  useEffect(() => {
    loadWebmasterAccounts();
    loadDirectAccounts();
  }, []);

  const loadWebmasterAccounts = async () => {
    try {
      const response = await fetch(
        buildUrl(API_CONFIG.ENDPOINTS.ADMIN.WEBMASTER_LIST_ACCOUNT)
      );

      if (response.ok) {
        const data = await response.json();
        setWebmasterAccounts(data.accounts);

      } else {
        throw new Error("Failed to load webmaster accounts");
      }
    } catch (error) {
      console.error("Error loading webmaster accounts:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аккаунты Яндекс.Вебмастер",
        variant: "destructive",
      });
    }
  };

  const loadDirectAccounts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildUrl("/semantix/admin/direct/list_tokens"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // data.tokens — массив объектов { id, token }
        setDirectAccounts(data.tokens || []);
      } else {
        throw new Error("Failed to load direct accounts");
      }
    } catch (error) {
      console.error("Error loading direct accounts:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аккаунты Яндекс.Директ",
        variant: "destructive",
      });
    }
  };

  const addWebmasterAccount = async () => {
    if (
      !newWebmasterAccount.login ||
      !newWebmasterAccount.password ||
      !newWebmasterAccount.security_answer
    ) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingWebmaster(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildUrl("/semantix/admin/webmaster/create_account"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            login: newWebmasterAccount.login,
            password: newWebmasterAccount.password,
            security_answer: newWebmasterAccount.security_answer,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        await loadWebmasterAccounts(); // Reload accounts from server
        setNewWebmasterAccount({ login: "", password: "", security_answer: "" });

        toast({
          title: "Успех",
          description: result.message || "Аккаунт Яндекс.Вебмастер добавлен",
        });
      } else {
        const errorData = await response.json();
        if (response.status === 400 || response.status === 404) {
          toast({
            title: "Введены неправильные данные",
            description: errorData.message || "Проверьте введенные данные",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.message || "Failed to create account");
        }
        return;
      }
    } catch (error) {
      console.error("Error adding webmaster account:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось добавить аккаунт",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWebmaster(false);
    }
  };

  const addDirectAccount = async () => {
    if (!newDirectAccount.token) {
      toast({
        title: "Ошибка",
        description: "Введите OAuth токен",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingDirect(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildUrl("/semantix/admin/direct/create_account"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            token: newDirectAccount.token,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        await loadDirectAccounts(); // Reload accounts from server
        setNewDirectAccount({ token: "" });

        toast({
          title: "Успех",
          description: result.message || "Аккаунт Яндекс.Директ добавлен",
        });
      } else {
        const errorData = await response.json();
        if (response.status === 400 || response.status === 404) {
          toast({
            title: "Введены неправильные данные",
            description: errorData.message || "Проверьте введенные данные",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.message || "Failed to create account");
        }
        return;
      }
    } catch (error) {
      console.error("Error adding direct account:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось добавить аккаунт",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDirect(false);
    }
  };

  const deleteWebmasterAccount = async (id: number) => {
    try {
      const accountToDelete = webmasterAccounts.find((acc) => acc.id === id);
      if (!accountToDelete) {
        throw new Error("Account not found");
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildUrl("/semantix/admin/webmaster/delete_account"),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            login: accountToDelete.login,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        await loadWebmasterAccounts(); // Reload accounts from server
        toast({
          title: "Успех",
          description: result.message || "Аккаунт Яндекс.Вебмастер удален",
        });
      } else {
        const errorData = await response.json();
        if (response.status === 400 || response.status === 404) {
          toast({
            title: "Введены неправильные данные",
            description: errorData.message || "Аккаунт не найден",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.message || "Failed to delete account");
        }
        return;
      }
    } catch (error) {
      console.error("Error deleting webmaster account:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось удалить аккаунт",
        variant: "destructive",
      });
    }
  };

  const deleteDirectAccount = async (id: number) => {
    try {
      const accountToDelete = directAccounts.find((acc) => acc.id === id);
      if (!accountToDelete) {
        throw new Error("Account not found");
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        buildUrl("/semantix/admin/direct/delete_account"),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            token: accountToDelete.token,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        await loadDirectAccounts(); // Reload accounts from server
        toast({
          title: "Успех",
          description: result.message || "Аккаунт Яндекс.Директ удален",
        });
      } else {
        const errorData = await response.json();
        if (response.status === 400 || response.status === 404) {
          toast({
            title: "Введены неправильные данные",
            description: errorData.message || "Аккаунт не найден",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.message || "Failed to delete account");
        }
        return;
      }
    } catch (error) {
      console.error("Error deleting direct account:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось удалить аккаунт",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Административная панель
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Yandex Webmaster Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Аккаунты Яндекс.Вебмастер
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing accounts table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Существующие аккаунты
                </h3>
                {webmasterAccounts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Статус</TableHead>
                        <TableHead>Логин</TableHead>
                        <TableHead>Пароль</TableHead>
                        <TableHead>Ответ на вопрос</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        webmasterAccounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    account.status === "active" ? "bg-green-500" :
                                      account.status === "error" ? "bg-red-500" :
                                        account.status === "warning" ? "bg-yellow-500" :
                                          "bg-gray-400"
                                  }`}
                                  title={
                                    account.status === "active" ? "Аккаунт работает нормально" :
                                      account.status === "error" ? "Проблема с аккаунтом" :
                                        account.status === "warning" ? "Предупреждение" :
                                          "Статус не определен"
                                  }
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {account.login}
                            </TableCell>
                            <TableCell>
                              {"•".repeat(account.password.length)}
                            </TableCell>
                            <TableCell>
                              {"•".repeat(account.security_answer.length)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteWebmasterAccount(account.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500">Нет добавленных аккаунтов</p>
                )}
              </div>

              {/* Add new account form */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Добавить новый аккаунт
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webmaster-login">Логин</Label>
                    <Input
                      id="webmaster-login"
                      type="text"
                      value={newWebmasterAccount.login}
                      onChange={(e) =>
                        setNewWebmasterAccount((prev) => ({
                          ...prev,
                          login: e.target.value,
                        }))
                      }
                      placeholder="Введите логин"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webmaster-password">Пароль</Label>
                    <Input
                      id="webmaster-password"
                      type="password"
                      value={newWebmasterAccount.password}
                      onChange={(e) =>
                        setNewWebmasterAccount((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Введите пароль"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webmaster-security">
                      Ответ на контрольный вопрос
                    </Label>
                    <Input
                      id="webmaster-security"
                      type="text"
                      value={newWebmasterAccount.security_answer}
                      onChange={(e) =>
                        setNewWebmasterAccount((prev) => ({
                          ...prev,
                          security_answer: e.target.value,
                        }))
                      }
                      placeholder="Введите ответ на контрольный вопрос"
                    />
                  </div>
                  <Button
                    onClick={addWebmasterAccount}
                    disabled={isLoadingWebmaster}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isLoadingWebmaster ? "Добавление..." : "Добавить аккаунт"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yandex Direct Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Аккаунты Яндекс.Директ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing accounts table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Существующие аккаунты
                </h3>
                {directAccounts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>OAuth токен</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {directAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">
                            {account.token}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDirectAccount(account.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500">Нет добавленных аккаунтов</p>
                )}
              </div>

              {/* Add new account form */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Добавить новый аккаунт
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="direct-oauth">OAuth токен</Label>
                    <Input
                      id="direct-oauth"
                      type="text"
                      value={newDirectAccount.token}
                      onChange={(e) =>
                        setNewDirectAccount((prev) => ({
                          ...prev,
                          token: e.target.value,
                        }))
                      }
                      placeholder="Введите OAuth токен"
                    />
                  </div>
                  <Button
                    onClick={addDirectAccount}
                    disabled={isLoadingDirect}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isLoadingDirect ? "Добавление..." : "Добавить аккаунт"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
