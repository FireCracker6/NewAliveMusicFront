import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { ActionMeta, InputActionMeta } from "react-select";
import Select from 'react-select';

type ArtistProfile = {
    artistName: string;
    description: string;
    genre: string[];
    artistPicturePath: string | undefined | null;
    bannerPicturePath: string | undefined | null;
}

type OptionType = {
    value: string;
    label: string;
}

const genreOptions: OptionType[] = [
    { value: 'rock', label: 'Rock ' },
    { value: 'pop', label: 'Pop' },
    { value: 'jazz', label: 'Jazz' },
]

const ArtistProfile: React.FC = () => {
    const [artistName, setArtistName] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState<readonly OptionType[] | null>(null);

    const handleGenreChange = (selectedOption: readonly OptionType[] | null) => {
        setGenre(selectedOption);
    };

    const handleSaveArtist = async () => {

    }

    return (
        <>
            <div className="container d-flex justify-content-center py-4">
                <div className="create-artist-profile-grid">
                    <div className="form-container">

                        <form onSubmit={handleSaveArtist} className="form">
                            <div className="artistName">
                                <label htmlFor="ArtistName">Artist Name:</label>
                                <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} />
                            </div>
                            <div className="description mt-2">
                                <label htmlFor="Description">Description:</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="genre">
                                <label htmlFor="Genre">Genre: </label>
                                <Select
                                    isMulti
                                    name="genres"
                                    options={genreOptions}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    onChange={handleGenreChange}
                                    value={genre}
                                    inputValue=""

                                />
                            </div>


                            <div className="button mt-4">
                                <button className="profile-form-button py-2" type="button" onClick={handleSaveArtist}>Create Artist Profile</button>
                            </div>

                        </form>
                    </div>
                    <div className="preview">

                    </div>
                </div>
            </div>
        </>
    );

}
export default ArtistProfile;