package dev.idachev.backend.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import dev.idachev.backend.exception.ImageProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", "recipe-images",
                    "resource_type", "auto"
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new ImageProcessingException("Failed to upload image");
        }
    }

    public String uploadImageFromUrl(String imageUrl) {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", "generated-recipe-images",
                    "resource_type", "auto"
            );
            Map<?, ?> uploadResult = cloudinary.uploader().upload(imageUrl, options);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            log.error("Failed to upload image from URL to Cloudinary", e);
            throw new ImageProcessingException("Failed to upload generated image");
        }
    }
}
