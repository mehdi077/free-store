'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Image as ImageIcon, PencilLine, Check, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Id } from "@/convex/_generated/dataModel";

interface PriceInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

function PriceInput({ value, onChange, placeholder }: PriceInputProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        value={value ?? ""}
        onChange={(e) => {
          // Only allow numbers
          const newValue = e.target.value.replace(/[^0-9]/g, '');
          onChange(newValue);
        }}
        placeholder={placeholder}
        className="pr-12" // Make room for the suffix
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 opacity-50 pointer-events-none">
        DA
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const settings = useQuery(api.settings.getSettings, {});
  const saveSettings = useMutation(api.settings.saveSettings);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const getUrl = useMutation(api.storage.getUrl);

  // Local form state
  const [form, setForm] = useState({
    store_name: "",
    phone_number: "",
    show_header: true,
  });
  
  // Image state management
  const [bigLogo, setBigLogo] = useState<string | null>(null);
  const [miniLogo, setMiniLogo] = useState<string | null>(null);
  const [bigLogoFile, setBigLogoFile] = useState<File | null>(null);
  const [miniLogoFile, setMiniLogoFile] = useState<File | null>(null);
  const [bigLogoPreview, setBigLogoPreview] = useState<string | null>(null);
  const [miniLogoPreview, setMiniLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Tariff state management
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [editedTariffs, setEditedTariffs] = useState<{
    [key: string]: {
      price?: string;
      delivery_office_price?: string;
      delivery_office_address?: string;
    };
  }>({});
  const [isSavingTariffs, setIsSavingTariffs] = useState(false);

  const tariffs = useQuery(api.tarif_livraison.getAllTariffs);
  const updateTariff = useMutation(api.tarif_livraison.updateTariff);

  // Initialize form once data arrives
  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name ?? "",
        phone_number: settings.phone_number ?? "",
        show_header: settings.show_header ?? true,
      });
      setBigLogo(settings.big_logo ?? null);
      setMiniLogo(settings.mini_logo ?? null);
      setBigLogoPreview(settings.big_logo ?? null);
      setMiniLogoPreview(settings.mini_logo ?? null);
    }
    if (settings === undefined) {
      // keep default
    } else if (settings === null) {
      // No doc: prompt creation
      setEditing(true);
    }
  }, [settings]);

  const validateImageRatio = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        resolve(Math.abs(ratio - 1) < 0.1); // Allow small deviation from perfect 1:1
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const onFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "big" | "mini"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setErrors(prev => ({ ...prev, [type === "big" ? "bigLogo" : "miniLogo"]: "" }));

    if (type === "mini") {
      const isValidRatio = await validateImageRatio(file);
      if (!isValidRatio) {
        setErrors(prev => ({ ...prev, miniLogo: "Le mini logo doit avoir un ratio 1:1" }));
        return;
      }
      setMiniLogoFile(file);
      setMiniLogoPreview(URL.createObjectURL(file));
    } else {
      setBigLogoFile(file);
      setBigLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File) => {
    const uploadUrl = await generateUploadUrl();
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Échec du téléchargement de l'image");
    const { storageId } = await res.json();
    const url = await getUrl({ storageId });
    return url;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let newBigLogoUrl = bigLogo;
      let newMiniLogoUrl = miniLogo;

      if (bigLogoFile) {
        newBigLogoUrl = await uploadFile(bigLogoFile);
      }

      if (miniLogoFile) {
        newMiniLogoUrl = await uploadFile(miniLogoFile);
      }

      await saveSettings({
        settingsId: settings?._id,
        ...form,
        big_logo: newBigLogoUrl ?? undefined,
        mini_logo: newMiniLogoUrl ?? undefined,
      });

      // Reset file states after successful save
      setBigLogoFile(null);
      setMiniLogoFile(null);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, save: "Erreur lors de la sauvegarde" }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTariffChange = (
    tariffId: Id<"tarif_livraison">,
    field: string,
    value: string
  ) => {
    setEditedTariffs((prev) => ({
      ...prev,
      [tariffId]: {
        ...prev[tariffId],
        [field]: value,
      },
    }));
  };

  const handleSaveAllTariffs = async () => {
    try {
      setIsSavingTariffs(true);
      await Promise.all(
        Object.entries(editedTariffs).map(([tariffId, changes]) =>
          updateTariff({
            tariffId: tariffId as Id<"tarif_livraison">,
            ...changes,
          })
        )
      );
      // Clear all edited states after successful save
      setEditedTariffs({});
      setIsSavingTariffs(false);
      // Close the modal
      setShowTariffModal(false);
    } catch (error) {
      console.error("Failed to update tariffs:", error);
      setIsSavingTariffs(false);
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      {settings === null && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
          <p className="text-blue-700 font-medium">
            Configurez vos informations
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        {/* Store Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom de la boutique
          </label>
          <Input
            name="store_name"
            value={form.store_name}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <Input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>

        {/* Show header */}
        <div className="flex items-center gap-2">
          <Switch
            checked={form.show_header}
            onCheckedChange={(val) =>
              editing && setForm((p) => ({ ...p, show_header: val }))
            }
            disabled={!editing}
          />
          <span>{"Afficher l'en-tête"}</span>
        </div>

        {/* Logos */}
        <div className="grid grid-cols-2 gap-4">
          {/* Big logo */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Logo principal</p>
              <p className="text-xs text-gray-500">Taille recommandée : 650 x 150 pixels</p>
            </div>
            {editing ? (
              <Button
                variant="outline"
                className={cn(
                  "w-full h-32 flex flex-col items-center justify-center gap-2 border-dashed",
                  errors.bigLogo ? "border-red-500" : "border-gray-300"
                )}
                onClick={() => document.getElementById("big-logo-input")?.click()}
              >
                {bigLogoPreview ? (
                  <img
                    src={bigLogoPreview}
                    alt="Big logo preview"
                    className="w-full h-32 object-contain"
                  />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Cliquez pour télécharger le grand logo</span>
                  </>
                )}
              </Button>
            ) : (
              bigLogo ? (
                <img
                  src={bigLogo}
                  alt="Big logo"
                  className="w-full h-32 object-contain border"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 border">
                  <ImageIcon size={32} />
                </div>
              )
            )}
            <input
              id="big-logo-input"
              type="file"
              accept="image/*"
              onChange={(e) => onFileSelect(e, "big")}
              className="hidden"
            />
            {errors.bigLogo && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.bigLogo}
              </p>
            )}
          </div>

          {/* Mini logo */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Icon (1:1)</p>
            {editing ? (
              <Button
                variant="outline"
                className={cn(
                  "w-24 h-24 mx-auto flex flex-col items-center justify-center gap-2 border-dashed",
                  errors.miniLogo ? "border-red-500" : "border-gray-300"
                )}
                onClick={() => document.getElementById("mini-logo-input")?.click()}
              >
                {miniLogoPreview ? (
                  <img
                    src={miniLogoPreview}
                    alt="Mini logo preview"
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-600">Ratio 1:1</span>
                  </>
                )}
              </Button>
            ) : (
              miniLogo ? (
                <img
                  src={miniLogo}
                  alt="Mini logo"
                  className="w-24 h-24 object-contain border mx-auto"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-gray-400 border mx-auto">
                  <ImageIcon size={24} />
                </div>
              )
            )}
            <input
              id="mini-logo-input"
              type="file"
              accept="image/*"
              onChange={(e) => onFileSelect(e, "mini")}
              className="hidden"
            />
            {errors.miniLogo && (
              <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                <AlertCircle className="w-4 h-4" /> {errors.miniLogo}
              </p>
            )}
          </div>
        </div>

        {errors.save && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.save}
          </p>
        )}

        {/* Action buttons */}
        {!editing ? (
          <Button variant="outline" className="mt-2" onClick={() => setEditing(true)}>
            <PencilLine className="mr-2 h-4 w-4" /> Modifier
          </Button>
        ) : (
          <Button className="mt-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Confirmer
              </>
            )}
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tarifs de livraison</h2>
          <Button onClick={() => setShowTariffModal(true)}>
            Gérer les tarifs
          </Button>
        </div>
      </div>

      <Dialog open={showTariffModal} onOpenChange={setShowTariffModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion des tarifs de livraison</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code Wilaya</TableHead>
                  <TableHead>Nom Wilaya</TableHead>
                  <TableHead>Prix de livraison</TableHead>
                  <TableHead>Prix bureau de livraison</TableHead>
                  <TableHead>Adresse bureau de livraison</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffs?.map((tariff) => (
                  <TableRow key={tariff._id}>
                    <TableCell className="font-medium">{tariff.wilaya_code}</TableCell>
                    <TableCell>{tariff.wilaya_name}</TableCell>
                    <TableCell>
                      <PriceInput
                        value={
                          editedTariffs[tariff._id]?.price !== undefined
                            ? editedTariffs[tariff._id].price
                            : tariff.price ?? ""
                        }
                        onChange={(value) =>
                          handleTariffChange(tariff._id, "price", value)
                        }
                        placeholder="Prix"
                      />
                    </TableCell>
                    <TableCell>
                      <PriceInput
                        value={
                          editedTariffs[tariff._id]?.delivery_office_price !== undefined
                            ? editedTariffs[tariff._id].delivery_office_price
                            : tariff.delivery_office_price ?? ""
                        }
                        onChange={(value) =>
                          handleTariffChange(
                            tariff._id,
                            "delivery_office_price",
                            value
                          )
                        }
                        placeholder="Prix bureau"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={
                          editedTariffs[tariff._id]?.delivery_office_address !== undefined
                            ? editedTariffs[tariff._id].delivery_office_address
                            : tariff.delivery_office_address ?? ""
                        }
                        onChange={(e) =>
                          handleTariffChange(
                            tariff._id,
                            "delivery_office_address",
                            e.target.value
                          )
                        }
                        placeholder="Adresse"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {Object.keys(editedTariffs).length > 0 && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSaveAllTariffs}
                  disabled={isSavingTariffs}
                  className="w-full sm:w-auto"
                >
                  {isSavingTariffs ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Enregistrer tous les changements
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
