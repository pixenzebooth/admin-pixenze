import { supabase } from '../lib/supabase';

// Fetch all frames
export const getFrames = async () => {
    const { data, error } = await supabase
        .from('frames')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// Helper to upload file
const uploadFile = async (file, bucket = 'frames') => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrlData.publicUrl;
};

// Create a new frame record
export const createFrame = async (frameData) => {
    // 1. Upload Main Image
    let imageUrl = frameData.image;
    if (frameData.file) {
        imageUrl = await uploadFile(frameData.file);
    }

    // 2. Upload Thumbnail (if exists)
    let thumbnailUrl = null;
    if (frameData.thumbnailFile) {
        thumbnailUrl = await uploadFile(frameData.thumbnailFile);
    }

    // 3. Insert Record
    const { data, error } = await supabase
        .from('frames')
        .insert([{
            name: frameData.name,
            image_url: imageUrl,
            thumbnail_url: thumbnailUrl,
            status: frameData.status || 'active',
            layout_config: frameData.layout_config,
            style: frameData.style || 'Custom',
            rarity: frameData.rarity || 'Common',
            artist: frameData.artist || 'Default',
            type: 'custom'
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Update a frame
export const updateFrame = async (id, updates) => {
    // Handle File Uploads for Updates (if any)
    // Note: The caller (FrameEditor) should separate file vs url logic, but we can do it here if we pass files in 'updates'

    // We'll assume 'updates' object might contain files that need uploading
    // This requires a bit of refactoring if passing raw 'updates' to supabase.update
    // Better to prepare the 'clean' updates object before calling supabase

    const dbUpdates = { ...updates };

    // Remove file objects from direct DB update
    delete dbUpdates.file;
    delete dbUpdates.thumbnailFile;

    // If new main file provided
    if (updates.file) {
        dbUpdates.image_url = await uploadFile(updates.file);
    }

    // If new thumbnail file provided
    if (updates.thumbnailFile) {
        dbUpdates.thumbnail_url = await uploadFile(updates.thumbnailFile);
    }

    const { data, error } = await supabase
        .from('frames')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete a frame
export const deleteFrame = async (id, imageUrl) => {
    // 1. Delete DB Record
    const { error } = await supabase
        .from('frames')
        .delete()
        .eq('id', id);

    if (error) throw error;

    // 2. Delete from Storage (Optional but good practice)
    // Extract filename from URL
    if (imageUrl) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
            await supabase.storage.from('frames').remove([fileName]);
        }
    }

    return true;
};
