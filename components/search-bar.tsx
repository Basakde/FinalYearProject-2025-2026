import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';

interface SearchBarProps {
    onQueryChange?: (newQuery: string) => void;
    onSearch?: () => void;   
    placeholder?: string;
    clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
    autoCorrect?: boolean;
    autoCapitalize?: 'none';
    className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Search',
    clearButtonMode = 'while-editing',
    autoCorrect = false,
    autoCapitalize = 'none',
    className = 'flex-1 text-white p-3',
}) => {

    const [query, setQuery] = React.useState("");

    const onQueryChange = (newQuery: string) => {
        setQuery(newQuery);
    };

    return (
        <View className="flex-row items-center bg-[#fbf7f4] rounded-xl m-4 px-3 py-2 shadow-sm">

            {/* Search Icon */}
            <Ionicons name="search-outline" size={22} color="#9ca3af" />

            {/* Input field */}
            <TextInput
                className={className}
                placeholder={placeholder}   
                placeholderTextColor="#9ca3af"
                value={query}
                onChangeText={onQueryChange}
                onSubmitEditing={onSearch}      
                clearButtonMode={clearButtonMode}
                autoCorrect={autoCorrect}
                autoCapitalize={autoCapitalize}
            />

            {/* Filter Icon */}
            <Ionicons name="options-outline" size={22} color="#9ca3af" />
        </View>
    );
};

export default SearchBar;
