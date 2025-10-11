import React from 'react';
import { Image, TextInput, View } from 'react-native';

interface SearchBar {
    //query?: string;
    onQueryChange?: (newQuery: string) => void;
    onSearch?: () => void;   
    placeholder?: string;
    clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
    autoCorrect?: boolean;
    autoCapitalize?: 'none';
    className?: string;
}

const SearchBar: React.FC<SearchBar> = ({
    //onQueryChange, 
    onSearch,
    placeholder = 'Search',
    clearButtonMode = 'while-editing',
    autoCorrect = false,
    autoCapitalize = 'none',
    className = 'flex-1 text-black p-3',
}) => {
    const [query,setQuery]=React.useState("");

    const onQueryChange = (newQuery: string) => {
        setQuery(newQuery);
        //onQueryChange(newQuery);
    }   

    return (
        <>
            <View className="flex-row items-center m-4 bg-white shadow-sm p-2">
                <View>
                    <Image 
                        source={require("../assets/images/search.png")}
                        style={{ width: 30, height: 30}} 
                    />
               </View>
                <TextInput
                    className={className}
                    placeholder={placeholder}   
                    value={query}
                    onChangeText={onQueryChange}
                    onSubmitEditing={onSearch}      
                    clearButtonMode={clearButtonMode}
                    autoCorrect={autoCorrect}
                    autoCapitalize={autoCapitalize}
                />
                <View>
                    <Image 
                        source={require("../assets/images/filter.png")}
                        style={{ width: 30, height: 30}} 
                    />
               </View>
            </View>
            
        </>
    );
}

export default SearchBar;
//<a href="https://www.flaticon.com/free-icons/search" title="search icons">Search icons created by Maxim Basinski Premium - Flaticon</a>