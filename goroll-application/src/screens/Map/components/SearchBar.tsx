import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BaseInput from "../../../components/common/BaseInput";
import { searchAutocomplete } from "../../../utils/map/GeoCode";
import BaseText from "../../../components/common/BaseText";
import { useAppContext } from "../../../contexts/app/AppContext";
import { useTranslation } from "react-i18next";
import { useLocationSearch } from "../../../services/api/hooks/useLocation";
import { handleAxiosError } from "../../../services/api/api";

type LocationItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type SearchBarProps = {
  onLocationSelect?: (item: LocationItem | null) => void;
};

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const { t, i18n } = useTranslation();
  const { language, handleShowError } = useAppContext();
  const [query, setQuery] = useState("");
  const [confirmedQuery, setConfirmedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [selectLocation, setSelectLocation] = useState<LocationItem | null>(
    null
  );

  const searchLocationMutation = useLocationSearch();

  const handleGetLocation = useCallback(async () => {
    try {
      const res = await searchLocationMutation.mutateAsync({
        name: query,
        limit: 10,
        pageNumber: 1,
      });

      return res.data.map((item) => ({
        id: `be-${item.id}`,
        name: `${item.name}, ${
          i18n.language === "th" ? item.category.nameTh : item.category.nameEn
        }, ${
          i18n.language === "th"
            ? item.accessLevel.nameTh
            : item.accessLevel.nameEn
        }`,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
      }));
    } catch (error) {
      console.error("Error fetching location:", error);
      return [];
    }
  }, [query, searchLocationMutation, i18n.language]);

  const handleFetchSuggestions = useCallback(async () => {
    try {
      if (confirmedQuery !== "" && query === confirmedQuery) {
        return;
      }
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      const results = await searchAutocomplete(query, language);
      const locationResults = await handleGetLocation();

      setSuggestions([...locationResults, ...results]);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [query, language, confirmedQuery, handleGetLocation, handleShowError]);

  const handleSelect = (item: LocationItem) => {
    setQuery(item.name);
    setConfirmedQuery(item.name);
    setSuggestions([]);
    setSelectLocation(item);
    onLocationSelect?.(item);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    setQuery("");
    setConfirmedQuery("");
    setSuggestions([]);
    setSelectLocation(null);
    onLocationSelect?.(null);
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    if (query.length > 0 && selectLocation) {
      onLocationSelect?.(selectLocation);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(handleFetchSuggestions, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-col mx-4">
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}
          className="flex-row items-center gap-x-3 bg-white rounded-lg overflow-hidden"
        >
          <View className="pl-3">
            <Ionicons name="search" size={20} color="#9ca3af" />
          </View>
          <BaseInput
            placeholder={t("main.search_place")}
            className="flex-1 text-black py-3"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
          />
          {query.length > 0 && (
            <View className="pr-3">
              <TouchableOpacity onPress={handleClear}>
                <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {suggestions.length > 0 && (
          <View className="bg-white mt-2 rounded-lg overflow-hidden max-h-60">
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className="p-3 border-b border-gray-200"
                >
                  <BaseText>{item.name}</BaseText>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
