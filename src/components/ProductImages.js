import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, IconButton, Tooltip, ButtonBase } from '@mui/material';
import { AddPhotoAlternateOutlined, BrokenImageOutlined, Close, StarBorder, CloudUploadOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

export const MAX_GALLERY = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

// Each image is either a saved path (string) or a newly picked File.
// Preview URLs for Files are created once and revoked when no longer shown.
function usePreviews(items, toUrl) {
  const urls = useMemo(() => new Map(), []);
  const list = items.map(item => {
    if (!(item instanceof File)) return toUrl(item);
    if (!urls.has(item)) urls.set(item, URL.createObjectURL(item));
    return urls.get(item);
  });
  useEffect(() => {
    for (const [file, url] of urls) {
      if (!items.includes(file)) { URL.revokeObjectURL(url); urls.delete(file); }
    }
  }, [items, urls]);
  useEffect(() => () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); }, [urls]);
  return list;
}

// Shows a neutral placeholder instead of a broken image if a saved URL no longer loads.
function Thumb({ src, alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (failed || !src) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'text.disabled' }} title="Image could not be loaded">
        <BrokenImageOutlined />
      </Box>
    );
  }
  return <Box component="img" src={src} alt={alt} onError={() => setFailed(true)} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
}

// Main image + gallery for the product dialogs: previews, drag and drop, remove, and "set as main".
// value: { profileImage: string | File | null, imageList: (string | File)[] }
export default function ProductImages({ value, onChange, toUrl, disabled }) {
  const { enqueueSnackbar } = useSnackbar();
  const mainInput = useRef(null);
  const galleryInput = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const main = value.profileImage || null;
  const gallery = value.imageList || [];
  const [mainUrl] = usePreviews(main ? [main] : [], toUrl);
  const galleryUrls = usePreviews(gallery, toUrl);

  const valid = (files) => files.filter(file => {
    if (!ACCEPT.split(',').includes(file.type)) {
      enqueueSnackbar(`${file.name}: use a JPG, PNG or WEBP image`, { variant: 'warning' });
      return false;
    }
    if (file.size > MAX_SIZE) {
      enqueueSnackbar(`${file.name} is larger than 5MB`, { variant: 'warning' });
      return false;
    }
    return true;
  });

  const setMain = (files) => {
    const [file] = valid(files);
    if (file) onChange({ ...value, profileImage: file });
  };

  const addToGallery = (files) => {
    const room = MAX_GALLERY - gallery.length;
    const picked = valid(files);
    if (picked.length > room) enqueueSnackbar(`Only ${MAX_GALLERY} gallery images allowed, so ${picked.length - room} were skipped`, { variant: 'warning' });
    if (room > 0 && picked.length) onChange({ ...value, imageList: [...gallery, ...picked.slice(0, room)] });
  };

  // Swaps a gallery image with the main one, so nothing is lost.
  const promote = (index) => {
    const next = [...gallery];
    const [chosen] = next.splice(index, 1);
    if (main) next.splice(index, 0, main);
    onChange({ profileImage: chosen, imageList: next });
  };

  const dropProps = (zone, handler) => ({
    onDragOver: (e) => { e.preventDefault(); if (!disabled) setDragOver(zone); },
    onDragLeave: () => setDragOver(null),
    onDrop: (e) => { e.preventDefault(); setDragOver(null); if (!disabled) handler(Array.from(e.dataTransfer.files)); }
  });

  const tile = { position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100', aspectRatio: '1 / 1' };
  const cornerBtn = { position: 'absolute', bgcolor: 'rgba(15,23,42,.65)', color: '#fff', p: 0.5, '&:hover': { bgcolor: 'rgba(15,23,42,.85)' } };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 2 }}>
      {/* Main image */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Main image</Typography>
        {main ? (
          <Box sx={{ ...tile, maxWidth: 220, outline: dragOver === 'main' ? '2px dashed' : 'none', outlineColor: 'primary.main' }} {...dropProps('main', setMain)}>
            <Thumb src={mainUrl} alt="Main product" />
            <Tooltip title="Remove">
              <IconButton size="small" aria-label="Remove main image" disabled={disabled} onClick={() => onChange({ ...value, profileImage: null })} sx={{ ...cornerBtn, top: 6, right: 6 }}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
            <ButtonBase disabled={disabled} onClick={() => mainInput.current.click()} sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, py: 0.75, bgcolor: 'rgba(15,23,42,.65)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              Change
            </ButtonBase>
          </Box>
        ) : (
          <ButtonBase
            disabled={disabled}
            onClick={() => mainInput.current.click()}
            {...dropProps('main', setMain)}
            sx={{ ...tile, width: '100%', maxWidth: 220, flexDirection: 'column', gap: 0.5, border: '2px dashed', borderColor: dragOver === 'main' ? 'primary.main' : 'grey.300', color: 'text.secondary', bgcolor: dragOver === 'main' ? 'action.hover' : 'grey.50' }}
          >
            <CloudUploadOutlined />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Upload main image</Typography>
            <Typography variant="caption">or drop it here</Typography>
          </ButtonBase>
        )}
        <input ref={mainInput} hidden type="file" accept={ACCEPT} onChange={e => { setMain(Array.from(e.target.files)); e.target.value = ''; }} />
      </Box>

      {/* Gallery */}
      <Box {...dropProps('gallery', addToGallery)} sx={{ borderRadius: 2, outline: dragOver === 'gallery' ? '2px dashed' : 'none', outlineColor: 'primary.main', outlineOffset: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Gallery <Typography component="span" variant="caption" color="text.secondary">({gallery.length}/{MAX_GALLERY})</Typography>
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 1 }}>
          {gallery.map((item, i) => (
            <Box key={item instanceof File ? `${item.name}-${item.lastModified}-${i}` : item} sx={tile}>
              <Thumb src={galleryUrls[i]} alt={`Gallery ${i + 1}`} />
              <Tooltip title="Remove">
                <IconButton size="small" aria-label={`Remove gallery image ${i + 1}`} disabled={disabled} onClick={() => onChange({ ...value, imageList: gallery.filter((_, n) => n !== i) })} sx={{ ...cornerBtn, top: 4, right: 4 }}>
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Set as main image">
                <IconButton size="small" aria-label={`Set gallery image ${i + 1} as main`} disabled={disabled} onClick={() => promote(i)} sx={{ ...cornerBtn, bottom: 4, left: 4 }}>
                  <StarBorder sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
          {gallery.length < MAX_GALLERY && (
            <ButtonBase
              disabled={disabled}
              onClick={() => galleryInput.current.click()}
              sx={{ ...tile, flexDirection: 'column', gap: 0.25, border: '2px dashed', borderColor: 'grey.300', color: 'text.secondary', bgcolor: 'grey.50', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
            >
              <AddPhotoAlternateOutlined />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Add</Typography>
            </ButtonBase>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
          JPG, PNG or WEBP up to 5MB. Drop images here, or tap <StarBorder sx={{ fontSize: 14, verticalAlign: 'text-bottom' }} aria-label="star" /> on one to make it the main image.
        </Typography>
        <input ref={galleryInput} hidden type="file" multiple accept={ACCEPT} onChange={e => { addToGallery(Array.from(e.target.files)); e.target.value = ''; }} />
      </Box>
    </Box>
  );
}
