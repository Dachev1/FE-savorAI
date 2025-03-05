package dev.idachev.backend.infrastructure.storage;

import com.cloudinary.Cloudinary;
import dev.idachev.backend.common.exception.ImageProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Service for handling image uploads to Cloudinary.
 */
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

    /**
     * Uploads an image file to Cloudinary.
     *
     * @param file MultipartFile to upload
     * @return URL of the uploaded image
     * @throws ImageProcessingException if upload fails
     */
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ImageProcessingException("Uploaded file is empty");
        }
        
        String uniqueFilename = generateUniqueFilename(file.getOriginalFilename());
        log.debug("Uploading image file: {} with unique name: {}", file.getOriginalFilename(), uniqueFilename);
        
        Map<String, Object> options = Map.of(
                "folder", RECIPE_IMAGES_FOLDER,
                "resource_type", RESOURCE_TYPE,
                "public_id", uniqueFilename
        );
        
        try {
            return processUpload(file.getBytes(), options);
        } catch (IOException e) {
            log.error("Failed to upload image: {}", file.getOriginalFilename(), e);
            throw new ImageProcessingException("Failed to upload image", e);
        }
    }

    /**
     * Uploads an image from a URL to Cloudinary.
     *
     * @param imageUrl URL of the image to upload
     * @return URL of the uploaded image
     * @throws ImageProcessingException if upload fails
     */
    public String uploadImageFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new ImageProcessingException("Image URL is empty");
        }
        
        log.debug("Uploading image from URL: {}", imageUrl);
        String uniqueFilename = generateUniqueFilename("generated-image");
        
        Map<String, Object> options = Map.of(
                "folder", GENERATED_RECIPE_IMAGES_FOLDER,
                "resource_type", RESOURCE_TYPE,
                "public_id", uniqueFilename
        );
        
        try {
            return processUpload(imageUrl, options);
        } catch (IOException e) {
            log.error("Failed to upload image from URL: {}", imageUrl, e);
            throw new ImageProcessingException("Failed to upload image from URL", e);
        }
    }

    /**
     * Processes the upload to Cloudinary.
     *
     * @param input Input to upload (byte array or URL)
     * @param options Upload options
     * @return URL of the uploaded image
     * @throws IOException if upload fails
     */
    private String processUpload(Object input, Map<String, Object> options) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(input, options);

        String secureUrl = (String) uploadResult.get("secure_url");
        if (secureUrl == null) {
            throw new ImageProcessingException("Image upload failed, secure URL is missing");
        }
        
        log.debug("Image uploaded successfully: {}", secureUrl);
        return secureUrl;
    }
    
    /**
     * Generates a unique filename for an image.
     *
     * @param originalFilename Original filename
     * @return Unique filename
     */
    private String generateUniqueFilename(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}
