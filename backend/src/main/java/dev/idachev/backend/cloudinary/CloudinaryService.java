package dev.idachev.backend.cloudinary;

import com.cloudinary.Cloudinary;
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

    private static final String RECIPE_IMAGES_FOLDER = "recipe-images";
    private static final String GENERATED_RECIPE_IMAGES_FOLDER = "generated-recipe-images";
    private static final String RESOURCE_TYPE = "auto";

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ImageProcessingException("Uploaded file is empty");
        }
        Map<String, Object> options = Map.of(
                "folder", RECIPE_IMAGES_FOLDER,
                "resource_type", RESOURCE_TYPE
        );
        try {
            return processUpload(file.getBytes(), options);
        } catch (IOException e) {
            log.error("Failed to upload image", e);
            throw new ImageProcessingException("Failed to upload image", e);
        }
    }

    public String uploadImageFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new ImageProcessingException("Image URL is empty");
        }
        Map<String, Object> options = Map.of(
                "folder", GENERATED_RECIPE_IMAGES_FOLDER,
                "resource_type", RESOURCE_TYPE
        );
        try {
            return processUpload(imageUrl, options);
        } catch (IOException e) {
            log.error("Failed to upload image from URL", e);
            throw new ImageProcessingException("Failed to upload image from URL", e);
        }
    }

    private String processUpload(Object input, Map<String, Object> options) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(input, options);

        String secureUrl = (String) uploadResult.get("secure_url");
        if (secureUrl == null) {
            throw new ImageProcessingException("Image upload failed, secure URL is missing");
        }
        return secureUrl;
    }
}
