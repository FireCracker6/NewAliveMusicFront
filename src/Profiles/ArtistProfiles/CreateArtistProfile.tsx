import { fabric } from "fabric";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { ActionMeta, InputActionMeta } from "react-select";
import Select from 'react-select';

type ArtistProfile = {
    ArtistName: string;
    Description: string;
    Genre: string[];
    artistPicturePath?: string | undefined | null;
    bannerPicturePath?: string | undefined | null;
    UserID: string;
}

type OptionType = {
    value: string;
    label: string;
}

const genreOptions: OptionType[] = [
    { value: 'rock', label: 'Rock ' },
    { value: 'pop', label: 'Pop' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'hiphop', label: 'Hip Hop' },
    { value: 'country', label: 'Country' },
    { value: 'classical', label: 'Classical' },
    { value: 'blues', label: 'Blues' },
    { value: 'folk', label: 'Folk' },
    { value: 'reggae', label: 'Reggae' },
    { value: 'metal', label: 'Metal' },
    { value: 'blackmetal', label: 'Black Metal'},
    { value: 'punk', label: 'Punk' },
    { value: 'alternative', label: 'Alternative' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'dance', label: 'Dance' },
    { value: 'indie', label: 'Indie' },
    { value: 'rnb', label: 'R&B' },
    { value: 'soul', label: 'Soul' },
]

const CreateArtistProfile: React.FC = () => {
    const [artistName, setArtistName] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState<readonly OptionType[] | null>(null);

      // State variables for error messages
  const [artistNameError, setArtistNameError] = useState('');
  const [genreError, setGenreError] = useState('');

    const handleGenreChange = (selectedOption: readonly OptionType[] | null) => {
        setGenre(selectedOption);
    };

    const handleSaveArtist = async (event: any) => {
        event.preventDefault();
    
        // Basic validation
        if (!artistName.trim()) {
            setArtistNameError('Artist name is required');
            return;
        }
        if (!genre || genre.length === 0) {
            setGenreError('At least one genre must be selected');
            return;
        }
    
        const token = localStorage.getItem('userJWTToken');
        let userId = '';
        if (token) {
            const decodedToken: any = jwtDecode(token);
            userId = decodedToken.nameid;
        }
        const formData = new FormData();
        formData.append('ArtistName', artistName);
        formData.append('Description', description);
        formData.append('Genre', JSON.stringify(genre?.map((g) => g.value) ?? []));
        formData.append('UserID', userId);
    
        const response = await fetch('http://192.168.1.80:5053/api/artistprofile/createartistprofile', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        console.log(result);
    
        // Clear the form
        setArtistName('');
        setDescription('');
        setGenre(null);
    };

    return (
        <>
            <div className="container d-flex justify-content-center py-4">
                <div className="create-artist-profile-grid">
                    <div className="form-container">

                        <form onSubmit={handleSaveArtist} className="form">
                            <div className="artistName">
                                <label htmlFor="ArtistName">Artist Name:</label>
                                <input
                                 type="text" 
                                 value={artistName} 
                                 onChange={(e) => {
                                    setArtistName(e.target.value);
                               //     setArtistNameError(''); // Clear the error message
                                  }} 
                                  />
                                {artistNameError && <div className="artist-error">{artistNameError}</div>}
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
                                  {genreError && <div className="artist-error">{genreError}</div>}
                            </div>
                            <div className="button mt-4 pb-5 mb-5">
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
export default CreateArtistProfile;